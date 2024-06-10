# Flourish simple customized control sheet demo

Using the concept of the control sheet moves API chart configurations from code to a spreadsheet, allowing non-technical users to control and maintain API charts. The control sheet is a flexible concept, not a recipe, and there are multiple ways of implementing a control sheet.

This demo covers a specific and simple implementation, exposing a small set of Flourish bindings and settings for Line, Bar, and Pie charts in a simple way.

See [here](TODO) for a more feature-rich but slightly more complex example. See [here](TODO LINK) for a more generic and flexible, yet complex example allowing any chart to be built and changed.

## Control sheet mechanics

[`app.js`](app.js) reads in a data sheet from [`data/data-sheet-simple.csv`](data/data-sheet-simple.csv) and the control sheet from [`data/control-sheet-simple.csv`](data/control-sheet-simple.csv) to compose the application.

**Each row** of the control sheet represents a chart being built, and **each column** configures the placement, or the Flourish settings of the chart.

You can expose more **settings** by creating a control sheet column for each setting as well as adding additional setter functions run in `mutateOptions`. `mutateOptions` is just a wrapper function around individual functions that overwrite the base visualization settings with the settings given in the control sheet.

`mutateOptions`, for example, runs `setTitles`, which just checks if the title/subtitle is in the `controlData` and mutates the respective settings in `state` accordingly:

```js
function setTitles(controlData, state) {
  if (controlData.title) state.state.layout.title = controlData.title;
  if (controlData.subtitle) state.state.layout.subtitle = controlData.subtitle;
}
```

You can easily add your own state mutation functions or extend this concept to bindings or even data.

## Control sheet columns

The following documents each column of the given [control sheet](data/control-sheet-simple.csv).

### Layout

`container`: The CSS selector for each section as specified in `index.html`.

### Base chart settings

`base_chart`: A Flourish chart ID of a published Flourish chart. The base chart's information is pulled in to set the chart's template, version, base settings, bindings, and data. Control sheet exposed options can be changed by the control sheet user.

`direct_chart`: A Flourish chart ID of a published Flourish chart that gets embedded directly rather than built by the Live API. Useful escape hatch if you want to show a chart as is without any control sheet or data configurations.

> [!NOTE]
> `app.js` gets the base chart configuration via the public endpoint `https://public.flourish.studio/visualisation/${<base chart ID>}/visualisation-object.json`. An alternative would be to use the Live API's `base_visualisation_id` property (see [here](https://developers.flourish.studio/api/replicate-visualization/#2-call-the-api-passing-in-base_visualisation_id)). As we're adding data in an array-of-objects format, you would also want to set the `base_visualisation_data_format` property to `"object"`.

`chart_type`: This example only works with the [Line, Bar, Pie template](https://app.flourish.studio/@flourish/line-bar-pie/24#chart_type), which allows you to specify different types of charts.

### Settings

The following columns allow the user to set Flourish settings as specified in the Template Settings section of each template's API documentation, like [for example here](https://app.flourish.studio/@flourish/line-bar-pie/24#api-template-settings-header).

`title`: Set the visualization title.

`subtitle`: Set the visualization subtitle.

`color_overrides`: Set any desired color overrides.

Note that this will only work with templates that expose these settings. The code can be updated to include different settings for different templates.
