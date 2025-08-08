"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

interface TooltipPayloadItem {
  value: unknown;
  name: string;
  dataKey: string | number;
  payload: unknown;
  color?: string;
  fill?: string;
}

interface PayloadData {
  fill?: string;
  color?: string;
}

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  className?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: string | number;
  labelFormatter?: (value: string | number, payload: TooltipPayloadItem[]) => React.ReactNode;
  labelClassName?: string;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const typedPayload = React.useMemo(() => payload ?? [], [payload]);

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || typedPayload.length === 0) return null;

      const [item] = typedPayload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);

      let value: React.ReactNode = null;
      if (!labelKey && typeof label === "string") {
        value = config[label as keyof typeof config]?.label || label;
      } else {
        value = itemConfig?.label;
      }

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value as string, typedPayload)}
          </div>
        );
      }

      return value ? <div className={cn("font-medium", labelClassName)}>{value}</div> : null;
    }, [label, labelFormatter, typedPayload, hideLabel, labelClassName, config, labelKey]);

    if (!active || typedPayload.length === 0) return null;

    const nestLabel = typedPayload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel && tooltipLabel}
        <div className="grid gap-1.5">
          {typedPayload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor =
              color ||
              ((item.payload as PayloadData)?.fill ??
                (item.payload as PayloadData)?.color) ||
              item.color;

            return (
              <div key={item.dataKey ?? index} className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className={cn("h-2 w-2 rounded", {
                      "bg-[--color-bg] border-[--color-border]": indicator === "dot",
                      "w-1 bg-[--color-bg] border-[--color-border]": indicator === "line",
                      "w-0 border border-dashed": indicator === "dashed",
                    })}
                    style={{
                      backgroundColor: indicatorColor,
                      borderColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex-1 justify-between">
                  <span>{itemConfig?.label || item.name}</span>
                  <span>{item.value?.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
    payload?: RechartsPrimitive.LegendPayload[];
    verticalAlign?: "top" | "bottom" | "middle";
  }
>(({ className, hideIcon = false, payload = [], verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (payload.length === 0) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div key={item.value ?? index} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div className="h-2 w-2 rounded" style={{ backgroundColor: item.color }} />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) return undefined;

  const payloadPayload =
    "payload" in payload &&
    typeof (payload as { payload: unknown }).payload === "object" &&
    (payload as { payload: unknown }).payload !== null
      ? (payload as { payload: Record<string, unknown> }).payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in (payload as Record<string, unknown>) &&
    typeof (payload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = (payload as Record<string, string>)[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
};

