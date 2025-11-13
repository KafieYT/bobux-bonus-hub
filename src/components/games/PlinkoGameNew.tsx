import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePoints } from '@/hooks/usePoints';
import { PlinkoEngine, type WinRecord } from '@/lib/plinko/PlinkoEngine';
import { BetMode, RiskLevel, rowCountOptions, type RowCount, binPayouts, autoBetIntervalMs } from '@/lib/plinko/constants';
import { getBinColors } from '@/lib/plinko/utils';
import { cn } from '@/lib/utils';

export interface PlinkoCopy {
  title: string;
  description: string;
  labels: {
    bet: string;
    risk: string;
    lastResult: string;
    history: string;
    multiplier: string;
    payout: string;
  };
  riskLevels: {
    low: string;
    medium: string;
    high: string;
  };
  actions: {
    drop: string;
  };
}

interface PlinkoGameProps {
  copy: PlinkoCopy;
}

export const PlinkoGame = ({ copy }: PlinkoGameProps) => {
  const { points, loading: pointsLoading, addPoints, subtractPoints, refreshPoints } = usePoints();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlinkoEngine | null>(null);
  
  const [betAmount, setBetAmount] = useState<number>(1);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.MEDIUM);
  const [rowCount, setRowCount] = useState<RowCount>(16);
  const [betMode, setBetMode] = useState<BetMode>(BetMode.MANUAL);
  const [autoBetInput, setAutoBetInput] = useState<number>(0);
  const [autoBetsLeft, setAutoBetsLeft] = useState<number | null>(null);
  const [autoBetInterval, setAutoBetInterval] = useState<NodeJS.Timeout | null>(null);
  const [winRecords, setWinRecords] = useState<WinRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const balance = points;
  const hasOutstandingBalls = false; // TODO: Track this from engine

  const binColors = getBinColors(rowCount);
  const binPayoutsForCurrent = binPayouts[rowCount][riskLevel];

  useEffect(() => {
    if (!canvasRef.current) return;

    const handleWinRecord = async (record: WinRecord) => {
      setWinRecords((prev) => [record, ...prev].slice(0, 50));
      
      // Add payout value to balance (the betAmount was already deducted when dropping the ball)
      // So we add the full payout value, which includes the betAmount back + profit
      const payoutPoints = Math.round(record.payout.value * 100) / 100; // Arrondir à 2 décimales
      if (payoutPoints > 0) {
        await addPoints(payoutPoints, `Plinko: Victoire x${record.payout.multiplier.toFixed(2)}`);
      }
      await refreshPoints();
    };

    // Balance change handler removed - we handle it in dropBall

    engineRef.current = new PlinkoEngine(
      canvasRef.current,
      betAmount,
      rowCount,
      riskLevel,
      undefined, // No balance change callback
      handleWinRecord,
    );

    engineRef.current.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateBetAmount(betAmount);
    }
  }, [betAmount]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateRowCount(rowCount);
    }
  }, [rowCount]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateRiskLevel(riskLevel);
    }
  }, [riskLevel]);

  const handleBetAmountChange = (value: string) => {
    const parsed = parseFloat(value.trim());
    if (isNaN(parsed)) {
      setBetAmount(0);
    } else {
      setBetAmount(Math.max(0, parsed));
    }
  };

  const handleBetAmountBlur = () => {
    if (betAmount < 0) {
      setBetAmount(0);
    }
  };

  const handleAutoBetInputChange = (value: string) => {
    const parsed = parseInt(value.trim());
    if (isNaN(parsed)) {
      setAutoBetInput(0);
    } else {
      setAutoBetInput(Math.max(0, parsed));
    }
  };

  const resetAutoBetInterval = () => {
    if (autoBetInterval !== null) {
      clearInterval(autoBetInterval);
      setAutoBetInterval(null);
    }
  };

  const autoBetDropBall = async () => {
    if (betAmount > balance || betAmount <= 0) {
      resetAutoBetInterval();
      return;
    }

    if (autoBetsLeft === null) {
      // Infinite mode
      await dropBall();
      return;
    }

    // Finite mode
    if (autoBetsLeft > 0) {
      await dropBall();
      setAutoBetsLeft((prev) => (prev !== null ? prev - 1 : null));
    }
    if (autoBetsLeft === 1 && autoBetInterval !== null) {
      resetAutoBetInterval();
      return;
    }
  };

  const dropBall = async () => {
    if (!engineRef.current) return;
    if (betAmount <= 0) {
      setErrorMessage('La mise doit être supérieure à 0');
      return;
    }
    if (balance < betAmount) {
      setErrorMessage('Solde insuffisant');
      return;
    }
    if (pointsLoading) {
      setErrorMessage('Chargement des points...');
      return;
    }

    setErrorMessage(null);
    
    // Deduct bet amount
    const success = await subtractPoints(Math.round(betAmount * 100) / 100, 'Plinko: mise');
    if (!success) {
      setErrorMessage('Erreur lors du débit des points');
      return;
    }

    engineRef.current.dropBall();
    await refreshPoints();
  };

  const handleBetClick = async () => {
    if (betMode === BetMode.MANUAL) {
      await dropBall();
    } else if (autoBetInterval === null) {
      setAutoBetsLeft(autoBetInput === 0 ? null : autoBetInput);
      const interval = setInterval(autoBetDropBall, autoBetIntervalMs);
      setAutoBetInterval(interval);
    } else if (autoBetInterval !== null) {
      resetAutoBetInterval();
    }
  };

  const isBetAmountNegative = betAmount < 0;
  const isBetExceedBalance = betAmount > balance;
  const isAutoBetInputNegative = autoBetInput < 0;
  const isDropBallDisabled =
    !engineRef.current ||
    isBetAmountNegative ||
    isBetExceedBalance ||
    isAutoBetInputNegative ||
    pointsLoading;

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[600px] w-full">
      {/* Sidebar */}
      <div className="flex flex-col gap-5 bg-card/50 border-2 border-border/50 p-3 lg:max-w-80 rounded-lg">
        {/* Balance Display */}
        <div className="text-center pb-2 border-b border-border/50">
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Solde
          </label>
          <div className="text-2xl font-bold text-primary">
            {pointsLoading ? "Chargement..." : `${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts`}
          </div>
        </div>
        
        {/* Bet Mode Toggle */}
        <div className="flex gap-1 rounded-full bg-background/50 p-1">
          <button
            disabled={autoBetInterval !== null}
            onClick={() => setBetMode(BetMode.MANUAL)}
            className={cn(
              'flex-1 rounded-full py-2 text-sm font-medium text-foreground transition hover:not-disabled:bg-muted active:not-disabled:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50',
              betMode === BetMode.MANUAL && 'bg-primary text-primary-foreground',
            )}
          >
            Manual
          </button>
          <button
            disabled={autoBetInterval !== null}
            onClick={() => setBetMode(BetMode.AUTO)}
            className={cn(
              'flex-1 rounded-full py-2 text-sm font-medium text-foreground transition hover:not-disabled:bg-muted active:not-disabled:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50',
              betMode === BetMode.AUTO && 'bg-primary text-primary-foreground',
            )}
          >
            Auto
          </button>
        </div>

        {/* Bet Amount */}
        <div className="relative">
          <label htmlFor="betAmount" className="text-sm font-medium text-foreground">
            Bet Amount
          </label>
          <div className="flex">
            <div className="relative flex-1">
              <Input
                id="betAmount"
                value={betAmount}
                onBlur={handleBetAmountBlur}
                onChange={(e) => handleBetAmountChange(e.target.value)}
                disabled={autoBetInterval !== null}
                type="number"
                min="0"
                step="0.01"
                className={cn(
                  'w-full rounded-l-md border-2 border-border bg-background py-2 pr-12 pl-3 text-sm text-foreground transition-colors',
                  (isBetAmountNegative || isBetExceedBalance) && 'border-destructive',
                )}
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground font-medium select-none pointer-events-none" aria-hidden="true">
                pts
              </div>
            </div>
            <button
              disabled={autoBetInterval !== null}
              onClick={() => setBetAmount(parseFloat((betAmount / 2).toFixed(2)))}
              className="touch-manipulation bg-muted px-4 font-bold text-foreground transition-colors hover:not-disabled:bg-muted/80 active:not-disabled:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              1/2
            </button>
            <button
              disabled={autoBetInterval !== null}
              onClick={() => setBetAmount(parseFloat((betAmount * 2).toFixed(2)))}
              className="touch-manipulation rounded-r-md bg-slate-600 px-4 text-sm font-bold text-white transition-colors hover:not-disabled:bg-slate-500 active:not-disabled:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              2×
            </button>
          </div>
          {isBetAmountNegative && (
            <p className="absolute text-xs leading-5 text-red-400">
              This must be greater than or equal to 0.
            </p>
          )}
          {isBetExceedBalance && (
            <p className="absolute text-xs leading-5 text-red-400">Can't bet more than your balance!</p>
          )}
        </div>

        {/* Risk Level */}
        <div>
          <label htmlFor="riskLevel" className="text-sm font-medium text-foreground">
            Risk
          </label>
          <Select
            value={riskLevel}
            onValueChange={(value) => setRiskLevel(value as RiskLevel)}
            disabled={hasOutstandingBalls || autoBetInterval !== null}
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RiskLevel.LOW}>{copy.riskLevels.low}</SelectItem>
              <SelectItem value={RiskLevel.MEDIUM}>{copy.riskLevels.medium}</SelectItem>
              <SelectItem value={RiskLevel.HIGH}>{copy.riskLevels.high}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row Count */}
        <div>
          <label htmlFor="rowCount" className="text-sm font-medium text-foreground">
            Rows
          </label>
          <Select
            value={rowCount.toString()}
            onValueChange={(value) => setRowCount(parseInt(value) as RowCount)}
            disabled={hasOutstandingBalls || autoBetInterval !== null}
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowCountOptions.map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto Bet Input */}
        {betMode === BetMode.AUTO && (
          <div>
          <label htmlFor="autoBetInput" className="text-sm font-medium text-foreground">
            Number of Bets
          </label>
            <div className="relative">
              <Input
                id="autoBetInput"
                value={autoBetInterval === null ? autoBetInput : autoBetsLeft ?? 0}
                disabled={autoBetInterval !== null}
                onBlur={(e) => handleAutoBetInputChange(e.target.value)}
                onChange={(e) => handleAutoBetInputChange(e.target.value)}
                type="number"
                min="0"
                className={cn(
                  'w-full rounded-md border-2 border-border bg-background py-2 pr-8 pl-3 text-sm text-foreground transition-colors',
                  isAutoBetInputNegative && 'border-destructive',
                )}
              />
              {autoBetInput === 0 && (
                <span className="absolute top-3 right-3 text-muted-foreground text-lg">∞</span>
              )}
            </div>
            {isAutoBetInputNegative && (
              <p className="text-xs leading-5 text-red-400">
                This must be greater than or equal to 0.
              </p>
            )}
          </div>
        )}

        {/* Drop Ball Button */}
        <button
          onClick={handleBetClick}
          disabled={isDropBallDisabled}
            className={cn(
              'touch-manipulation rounded-md py-3 font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground',
              autoBetInterval !== null
                ? 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-foreground'
                : 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground',
            )}
        >
          {betMode === BetMode.MANUAL
            ? copy.actions.drop
            : autoBetInterval === null
              ? 'Start Autobet'
              : 'Stop Autobet'}
        </button>

        {errorMessage && (
          <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">{errorMessage}</p>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        <div className="relative bg-background border-2 border-border/50 rounded-lg overflow-hidden">
          <div
            className="mx-auto flex h-full flex-col px-4 pb-4"
            style={{ maxWidth: `${PlinkoEngine.WIDTH}px` }}
          >
            <div className="relative w-full" style={{ aspectRatio: `${PlinkoEngine.WIDTH} / ${PlinkoEngine.HEIGHT}` }}>
              <canvas
                ref={canvasRef}
                width={PlinkoEngine.WIDTH}
                height={PlinkoEngine.HEIGHT}
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {/* Bins Row */}
            {engineRef.current && (
              <div className="flex h-[clamp(10px,0.352px+2.609vw,16px)] w-full justify-center lg:h-7">
                <div
                  className="flex gap-[1%]"
                  style={{
                    width: `${(engineRef.current.binsWidthPercentage ?? 0) * 100}%`,
                  }}
                >
                  {binPayoutsForCurrent.map((payout, binIndex) => (
                    <div
                      key={binIndex}
                      className="flex min-w-0 flex-1 items-center justify-center rounded-xs text-[clamp(6px,2.784px+0.87vw,8px)] font-bold text-gray-950 shadow-[0_2px_var(--shadow-color)] lg:rounded-md lg:text-[clamp(10px,-16.944px+2.632vw,12px)] lg:shadow-[0_3px_var(--shadow-color)]"
                      style={{
                        backgroundColor: binColors.background[binIndex],
                        ['--shadow-color' as string]: binColors.shadow[binIndex],
                      }}
                    >
                      {payout}
                      {payout < 100 ? '×' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Wins */}
        {winRecords.length > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">{copy.labels.history}</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {winRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/80 px-3 py-2 text-xs"
                  >
                    <span>#{record.binIndex + 1}</span>
                    <span>
                      {copy.labels.multiplier}: x{record.payout.multiplier.toFixed(2)}
                    </span>
                    <span>
                      {copy.labels.payout}: {record.payout.value.toFixed(2)} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlinkoGame;

