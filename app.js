/* API KEY */
const API_KEY = "ADD YOUR API KEY HERE";

/* Fetch helper */

async function getBaseChartConfig(controlData) {
  // Iterate over the rows and add base chart configurations
  for (const row of controlData) {
    // Only done for base and not direct charts (which will be embedded rather
    // than API produced)
    if (row.base_chart) {
      try {
        // Fetching the base charct configs. Note, this should be optimised if
        // you're expecting repeating base chart id's
        row.base_chart_config = await d3.json(
          `https://public.flourish.studio/visualisation/${row.base_chart}/visualisation-object.json`
        );
      } catch (error) {
        // Basic error handling
        console.error(
          `Failed to fetch data for base_chart ${row.base_chart}:`,
          error
        );
        row.base_chart_config = null;
      }
    }
  }
  return controlData;
}

/* Live API configuration mutation function. Add more alongside control sheet variables. */

function setChartType(controlData, state) {
  if (controlData.chart_type) state.state.chart_type = controlData.chart_type;
}

function setTitles(controlData, state) {
  if (controlData.title) state.state.layout.title = controlData.title;
  if (controlData.subtitle) state.state.layout.subtitle = controlData.subtitle;
}

function setColorOverrides(controlData, state) {
  if (controlData.color_overrides)
    state.state.color.categorical_custom_palette = controlData.color_overrides;
}

function mutateOptions(controlData, state) {
  setChartType(controlData, state);
  setTitles(controlData, state);
  setColorOverrides(controlData, state);
}

/* Chart build functions */

function buildAPIChart(controlData, dataset) {
  const { base_chart_config: baseChartConfig, ...controlSheetData } =
    controlData;

  // Setting the API chart base configurations.
  const base = {
    api_key: API_KEY,
    template: baseChartConfig.template,
    version: baseChartConfig.version,
    container: controlSheetData.container,
  };

  // The settings (`state`) and the bindings are being taken straight from the
  // base chart configuration.
  const state = {
    state: _.cloneDeep(baseChartConfig.state),
  };

  const bindings = {
    bindings: _.cloneDeep(baseChartConfig.bindings),
  };

  // The data comes from the dataset
  const data = {
    data: {
      data: dataset,
    },
  };

  // Options changed by the control sheet are muted here
  mutateOptions(controlData, state);

  // Compose the final Live API options object
  const apiOptions = { ...base, ...state, ...bindings, ...data };

  // Build the chart.
  const hasVisual = controlData.hasOwnProperty("visual");

  // Built on initial load but updated on update
  if (!hasVisual) {
    // We add the visual to the options object to test if we can update next
    // time we see this chart
    controlData.visual = new Flourish.Live(apiOptions);
  } else {
    controlData.visual.update(apiOptions);
  }
}

function buildDirectChart(controlData) {
  const directChartContainer = d3.select(controlData.container);

  directChartContainer.selectAll("*").remove();

  directChartContainer
    .append("iframe")
    .attr(
      "src",
      `https://flo.uri.sh/visualisation/${controlData.direct_chart}/embed`
    )
    .attr("title", "Interactive or visual content")
    .attr("class", "flourish-embed-iframe")
    .attr("frameborder", "0")
    .attr("scrolling", "no")
    .attr(
      "sandbox",
      "allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
    )
    .style("width", "100%")
    .style("height", "100%");
}

function buildVisual(chartControlData, dataset) {
  // Check what type of chart to build. If the control sheet has a `base_chart`
  // column set, the chart will be API produced. If a `direct_chart` column is
  // set, the chart will be embedded.
  if (chartControlData.base_chart) buildAPIChart(chartControlData, dataset);
  if (chartControlData.direct_chart) buildDirectChart(chartControlData);
  if (!chartControlData.base_chart && !chartControlData.direct_chart)
    throw new Error(
      "Please assign either a base_chart or a direct_chart visualization id"
    );
}

async function main(controlData, dataset) {
  // Add base chart configurations to each `controlData` row
  const augmentedControlData = await getBaseChartConfig(controlData);
  for (const chart of augmentedControlData) buildVisual(chart, dataset);
}

/* Fetch data */

const chartInfo = d3.csv(
  `data/control-sheet-simple.csv?${Math.random()}`,
  d3.autoType
);
const chartData = d3.csv(
  `data/data-sheet-simple.csv?${Math.random()}`,
  d3.autoType
);

Promise.all([chartInfo, chartData]).then((res) => main(res[0], res[1]));
