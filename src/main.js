var apiBaseURL = "https://corona.lmao.ninja";

var currentAPIVersion = "/v2";

fetch(`${apiBaseURL}${currentAPIVersion}/countries?sort=cases`)
  .then(response => response.json())
  .then(data => {
    updateCountryGrid(data);
  })
  .catch(error => console.error(error));

fetch(`${apiBaseURL}${currentAPIVersion}/all`)
  .then(response => response.json())
  .then(data => {
    setLastUpdated(data.updated);
    setKPIValues(data);
  })
  .catch(error => console.error(error));

fetch(`${apiBaseURL}${currentAPIVersion}/historical`)
  .then(response => response.json())
  .then(data => {
    updateKPICharts(historicalDataParser(data));
  })
  .catch(error => console.error(error));

function formatLocale(num) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3
  }).format(num);
}

function formatNum(num) {
  let si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

function updateCountryGrid(param) {
  var countryOutbreakData = [];
  var schema = [
    {
      name: "country_flag_url"
    },
    {
      name: "country"
    },
    {
      name: "confirmed_cases",
      type: "number"
    },
    {
      name: "confirmed_cases_today",
      type: "number"
    },
    {
      name: "deaths",
      type: "number"
    },
    {
      name: "deaths_today",
      type: "number"
    },
    {
      name: "recovered",
      type: "number"
    },
    {
      name: "active",
      type: "number"
    },
    {
      name: "critical",
      type: "number"
    },
    {
      name: "positive_rate",
      type: "number"
    },
    {
      name: "fatality_rate",
      type: "number"
    }
  ];

  for (let i = 0; i < param.length; i++) {
    countryOutbreakData.push([
      param[i].countryInfo.flag,
      param[i].country,
      param[i].cases,
      param[i].todayCases,
      param[i].deaths,
      param[i].todayDeaths,
      param[i].recovered,
      param[i].active,
      param[i].critical,
      Math.round((param[i].recovered / param[i].cases) * 100 * 100) / 100,
      Math.round((param[i].deaths / param[i].cases) * 100 * 100) / 100
    ]);
  }

  var container = document.getElementById("grid-container");
  var dataStore = new FusionDataStore();
  var dataTable = dataStore.createDataTable(countryOutbreakData, schema);

  var gridConfig = {
    viewports: {
      desktop: {
        layout: {
          density: "default"
        }
      },
      mobile: {
        config: {
          layout: {
            type: "card"
          },
          defaultColumnOptions: {
            cellStyle: {
              "font-family": "Public Sans",
              "font-weight": 300,
              "font-size": "0.875rem",
              color: "rgb(54, 54, 54)"
            },
            headerStyle: {
              "font-family": "Public Sans",
              "font-weight": 500,
              "font-size": "0.875rem",
              color: "rgb(54, 54, 54)",
              background: "rgba(237, 242, 247, 1)"
            }
          },
          columns: [
            {
              field: "country",
              type: "html",
              width: 250,
              template: function(params) {
                return `
                    <div style="display: flex; align-items:center;">
                      <span><img src="${params.values["country_flag_url"]}" width="20" height="16"></span>
                      <span style="padding-left: 5px; font-weight: 500;">${params.values["country"]}</span>
                    </div>
                    `;
              }
            },
            {
              field: "confirmed_cases",
              headerText: "Total Cases",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "confirmed_cases_today",
              headerText: "New Cases",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "deaths",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "deaths_today",
              headerText: "New Deaths",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "critical",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "recovered",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "active",
              formatter: function(params) {
                return formatLocale(params.cellValue);
              }
            },
            {
              field: "positive_rate",
              headerText: "Positive Rate",
              formatter: function(param) {
                return param.cellValue + `%`;
              }
            },
            {
              field: "fatality_rate",
              headerText: "Fatality Rate",
              formatter: function(param) {
                return param.cellValue + `%`;
              }
            }
          ]
        }
      }
    },
    defaultColumnOptions: {
      cellStyle: {
        "font-family": "Public Sans",
        "font-weight": 300,
        "font-size": "0.875rem",
        color: "rgb(54, 54, 54)"
      },
      headerStyle: {
        "font-family": "Public Sans",
        "font-weight": 500,
        "font-size": "0.875rem",
        color: "rgb(54, 54, 54)",
        background: "rgba(237, 242, 247, 1)"
      }
    },
    columns: [
      {
        field: "country",
        type: "html",
        width: 250,
        template: function(params) {
          return `
              <div style="display: flex; align-items:center;">
                <span><img src="${params.values["country_flag_url"]}" width="18" height="14"></span>
                <span style="padding-left: 10px; font-weight: 500; width: 200px;">${params.values["country"]}</span>
                <span style="padding-left: 10px; color: rgb(229, 62, 62); font-size: 0.75rem; font-weight: 300;">↑${params.values["confirmed_cases_today"]}</span>
              </div>
              `;
        }
      },
      {
        field: "confirmed_cases",
        headerText: "Total Cases",
        type: "chart",
        width: 260,
        chartConfig: {
          showValue: 1,
          valueTextPosition: "left",
          style: {
            positiveBarStyle: {
              fill: "rgb(229, 62, 62)"
            },
            valueTextStyle: {
              "font-family": "Public Sans",
              "font-weight": 300,
              "font-size": "0.875rem",
              fill: "rgb(54, 54, 54)"
            }
          }
        },
        formatter: function(params) {
          return formatLocale(params.cellValue);
        },
        headerStyle: {
          color: "rgb(229, 62, 62)"
        }
      },
      {
        field: "deaths",
        width: 110,
        formatter: function(params) {
          return formatLocale(params.cellValue);
        },
        headerStyle: {
          color: "rgb(113, 128, 150)"
        }
      },
      {
        field: "critical",
        width: 110,
        formatter: function(params) {
          return formatLocale(params.cellValue);
        },
        headerStyle: {
          color: "rgb(229, 62, 62)"
        }
      },
      {
        field: "recovered",
        width: 110,
        formatter: function(params) {
          return formatLocale(params.cellValue);
        },
        headerStyle: {
          color: "rgb(18, 196, 86)"
        }
      },
      {
        field: "active",
        width: 110,
        formatter: function(params) {
          return formatLocale(params.cellValue);
        },
        headerStyle: {
          color: "rgb(20, 128, 230)"
        }
      },
      {
        field: "positive_rate",
        headerText: "Positive Rate",
        width: 120,
        formatter: function(param) {
          return `${param.cellValue}%`;
        }
      },
      {
        field: "fatality_rate",
        headerText: "Fatality Rate",
        width: 120,
        formatter: function(param) {
          return `${param.cellValue}%`;
        }
      }
    ],
    rowOptions: {
      hover: {
        enable: true,
        style: {
          background: "rgba(237, 242, 247, 0.75)"
        }
      }
    }
  };

  var grid = new FusionGrid(container, dataTable, gridConfig);
  grid.render();
}

function setLastUpdated(param) {
  var lastUpdatedTag = document.getElementById("last-updated");
  lastUpdatedTag.innerHTML = `Last Updated: ${dayjs(param).format(
    "DD-MMM-YYYY HH:mm:ss"
  )}`;
}

function setKPIValues(param) {
  // total cases
  var totalCasesTitle = document.getElementById("total-cases-title");
  totalCasesTitle.setAttribute("title", formatLocale(param.cases));
  totalCasesTitle.innerHTML = formatNum(param.cases);

  // total deaths
  var totalDeathsTitle = document.getElementById("total-deaths-title");
  totalDeathsTitle.setAttribute("title", formatLocale(param.deaths));
  totalDeathsTitle.innerHTML = formatNum(param.deaths);

  // total recovered
  var totalRecoveredTitle = document.getElementById("total-recovered-title");
  totalRecoveredTitle.setAttribute("title", formatLocale(param.recovered));
  totalRecoveredTitle.innerHTML = formatNum(param.recovered);

  // total active
  var totalActiveTitle = document.getElementById("total-active-title");
  totalActiveTitle.setAttribute("title", formatLocale(param.active));
  totalActiveTitle.innerHTML = formatNum(param.active);

  // positive rate
  var positiveRate = 0;
  positiveRate = (param.recovered / param.cases) * 100;
  positiveRate = Math.round(positiveRate * 100) / 100;

  // fatality rate
  fatalityRate = (param.deaths / param.cases) * 100;
  fatalityRate = Math.round(fatalityRate * 100) / 100;

  var pnfRateChart = new FusionCharts({
    type: "stackedbar2d",
    renderAt: "pnf-rate-viz",
    id: "pnf-rate-chart",
    width: "100%",
    height: "90%",
    dataFormat: "json",
    dataSource: {
      chart: {
        stack100Percent: 1,
        showLegend: 0,
        showValues: 0,
        showLimits: 0,
        showDivLineValues: 0,
        canvasBgAlpha: 0,
        bgColor: "#FFFFFF",
        chartTopMargin: 0,
        chartBottomMargin: 0,
        chartLeftMargin: 0,
        chartRightMargin: 0,
        canvasTopMargin: 0,
        canvasBottomMargin: 0,
        canvasLeftMargin: 0,
        canvasRightMargin: 0,
        showBorder: 0,
        showCanvasBorder: 0,
        baseFont: "Public Sans",
        baseFontSize: 16,
        showAlternateVGridColor: 0,
        usePlotGradientColor: 0,
        divLineAlpha: 0,
        showPlotBorder: 0,
        showToolTip: 0,
        labelFontSize: 16,
        labelFontColor: "#363636"
      },
      categories: [
        {
          category: [
            {
              label: `Positive Rate<br>${positiveRate}%`
            },
            {
              label: `Fatality Rate<br>${fatalityRate}%`
            }
          ]
        }
      ],
      dataset: [
        {
          seriesname: "Value",
          data: [
            {
              value: positiveRate,
              color: "#12c456"
            },
            {
              value: fatalityRate,
              color: "#e53e3e"
            }
          ]
        },
        {
          seriesname: "Balance",
          data: [
            {
              value: 100 - positiveRate,
              color: "#BDBEBF"
            },
            {
              value: 100 - fatalityRate,
              color: "#BDBEBF"
            }
          ]
        }
      ]
    }
  }).render();
}

function historicalDataParser(param) {
  var details = {};
  function consolidate(param, key) {
    Object.keys(param.timeline[key]).forEach(date => {
      if (details[date]) {
        if (details[date][key] == 0 || details[date][key]) {
          details[date][key] += param.timeline[key][date];
        } else {
          details[date][key] = param.timeline[key][date];
        }
      } else {
        details[date] = {
          [key]: param.timeline[key][date]
        };
      }
    });
  }

  param.forEach(param => {
    consolidate(param, "cases");
    consolidate(param, "deaths");
    consolidate(param, "recovered");
  });

  return Object.keys(details).map(date => ({
    Date: date,
    Cases: details[date]["cases"],
    Deaths: details[date]["deaths"],
    Recovered: details[date]["recovered"]
  }));
}

function updateKPICharts(param) {
  var totalCasesArr = [];
  var totalDeathsArr = [];
  var totalRecoveredArr = [];
  var totalActiveArr = [];

  for (let i = 0; i < param.length; i++) {
    totalCasesArr.push({
      label: dayjs(param[i].Date).format("DD-MMM-YYYY"),
      value: param[i].Cases
    });

    totalDeathsArr.push({
      label: dayjs(param[i].Date).format("DD-MMM-YYYY"),
      value: param[i].Deaths
    });

    totalRecoveredArr.push({
      label: dayjs(param[i].Date).format("DD-MMM-YYYY"),
      value: param[i].Recovered
    });

    totalActiveArr.push({
      label: dayjs(param[i].Date).format("DD-MMM-YYYY"),
      value: param[i].Cases - (param[i].Deaths + param[i].Recovered)
    });
  }

  var totalCasesKPIViz = new FusionCharts({
    type: "splinearea",
    width: "100%",
    height: "150",
    renderAt: "total-cases-kpi",
    id: "total-cases-kpi-viz",
    dataFormat: "json",
    dataSource: {
      chart: {
        showCanvasBorder: 0,
        showBorder: 0,
        showValues: 0,
        showlabels: 0,
        chartTopMargin: 0,
        chartBottomMargin: 0,
        chartLeftMargin: 0,
        chartRightMargin: 0,
        canvasTopMargin: 0,
        canvasBottomMargin: 0,
        canvasLeftMargin: 0,
        canvasRightMargin: 0,
        showTooltip: 1,
        drawCrossLine: 1,
        drawAnchors: 0,
        paletteColors: "#e53e3e",
        anchorBgColor: "#e53e3e",
        drawFullAreaBorder: 0,
        showDivLineValues: 0,
        showLimits: 0,
        showYAxisValues: 0,
        showAlternateHGridColor: 0,
        divLineAlpha: 0,
        zeroPlaneThickness: 0,
        baseFont: "Public Sans",
        baseFontSize: 14,
        tooltipBorderAlpha: 0,
        toolTipColor: "#FFFFFF",
        showToolTipShadow: 0,
        tooltipBorderRadius: 3,
        toolTipBgColor: "#363636",
        tooltipPadding: 6,
        showShadow: 0,
        bgColor: "#FFFFFF",
        canvasBgAlpha: 0,
        plotBorderThickness: 3,
        plotBorderAlpha: 100,
        usePlotGradientColor: 0,
        plotFillAlpha: 10,
        canvasPadding: 0,
        plotToolText:
          "<div style='line-height: 1.1rem;'>$label<br><b>$dataValue</b></div>"
      },
      data: totalCasesArr
    }
  }).render();

  var totalDeathsKPIViz = new FusionCharts({
    type: "splinearea",
    width: "100%",
    height: "150",
    renderAt: "total-deaths-kpi",
    id: "total-deaths-kpi-viz",
    dataFormat: "json",
    dataSource: {
      chart: {
        showCanvasBorder: 0,
        showBorder: 0,
        showValues: 0,
        showlabels: 0,
        chartTopMargin: 0,
        chartBottomMargin: 0,
        chartLeftMargin: 0,
        chartRightMargin: 0,
        canvasTopMargin: 0,
        canvasBottomMargin: 0,
        canvasLeftMargin: 0,
        canvasRightMargin: 0,
        showTooltip: 1,
        drawCrossLine: 1,
        drawAnchors: 0,
        paletteColors: "#718096",
        anchorBgColor: "#718096",
        drawFullAreaBorder: 0,
        showDivLineValues: 0,
        showLimits: 0,
        showYAxisValues: 0,
        showAlternateHGridColor: 0,
        divLineAlpha: 0,
        zeroPlaneThickness: 0,
        baseFont: "Public Sans",
        baseFontSize: 14,
        tooltipBorderAlpha: 0,
        toolTipColor: "#FFFFFF",
        showToolTipShadow: 0,
        tooltipBorderRadius: 3,
        toolTipBgColor: "#363636",
        tooltipPadding: 6,
        showShadow: 0,
        bgColor: "#FFFFFF",
        canvasBgAlpha: 0,
        plotBorderThickness: 3,
        plotBorderAlpha: 100,
        usePlotGradientColor: 0,
        plotFillAlpha: 10,
        canvasPadding: 0,
        plotToolText:
          "<div style='line-height: 1.1rem;'>$label<br><b>$dataValue</b></div>"
      },
      data: totalDeathsArr
    }
  }).render();

  var totalRecoveredKPIViz = new FusionCharts({
    type: "splinearea",
    width: "100%",
    height: "150",
    renderAt: "total-recovered-kpi",
    id: "total-recovered-kpi-viz",
    dataFormat: "json",
    dataSource: {
      chart: {
        showCanvasBorder: 0,
        showBorder: 0,
        showValues: 0,
        showlabels: 0,
        chartTopMargin: 0,
        chartBottomMargin: 0,
        chartLeftMargin: 0,
        chartRightMargin: 0,
        canvasTopMargin: 0,
        canvasBottomMargin: 0,
        canvasLeftMargin: 0,
        canvasRightMargin: 0,
        showTooltip: 1,
        drawCrossLine: 1,
        drawAnchors: 0,
        paletteColors: "#12c456",
        anchorBgColor: "#12c456",
        drawFullAreaBorder: 0,
        showDivLineValues: 0,
        showLimits: 0,
        showYAxisValues: 0,
        showAlternateHGridColor: 0,
        divLineAlpha: 0,
        zeroPlaneThickness: 0,
        baseFont: "Public Sans",
        baseFontSize: 14,
        tooltipBorderAlpha: 0,
        toolTipColor: "#FFFFFF",
        showToolTipShadow: 0,
        tooltipBorderRadius: 3,
        toolTipBgColor: "#363636",
        tooltipPadding: 6,
        showShadow: 0,
        bgColor: "#FFFFFF",
        canvasBgAlpha: 0,
        plotBorderThickness: 3,
        plotBorderAlpha: 100,
        usePlotGradientColor: 0,
        plotFillAlpha: 10,
        canvasPadding: 0,
        plotToolText:
          "<div style='line-height: 1.1rem;'>$label<br><b>$dataValue</b></div>"
      },
      data: totalRecoveredArr
    }
  }).render();

  var totalActiveKPIViz = new FusionCharts({
    type: "splinearea",
    width: "100%",
    height: "150",
    renderAt: "total-active-kpi",
    id: "total-active-kpi-viz",
    dataFormat: "json",
    dataSource: {
      chart: {
        showCanvasBorder: 0,
        showBorder: 0,
        showValues: 0,
        showlabels: 0,
        chartTopMargin: 0,
        chartBottomMargin: 0,
        chartLeftMargin: 0,
        chartRightMargin: 0,
        canvasTopMargin: 0,
        canvasBottomMargin: 0,
        canvasLeftMargin: 0,
        canvasRightMargin: 0,
        showTooltip: 1,
        drawCrossLine: 1,
        drawAnchors: 0,
        paletteColors: "#1480e6",
        anchorBgColor: "#1480e6",
        drawFullAreaBorder: 0,
        showDivLineValues: 0,
        showLimits: 0,
        showYAxisValues: 0,
        showAlternateHGridColor: 0,
        divLineAlpha: 0,
        zeroPlaneThickness: 0,
        baseFont: "Public Sans",
        baseFontSize: 14,
        tooltipBorderAlpha: 0,
        toolTipColor: "#FFFFFF",
        showToolTipShadow: 0,
        tooltipBorderRadius: 3,
        toolTipBgColor: "#363636",
        tooltipPadding: 6,
        showShadow: 0,
        bgColor: "#FFFFFF",
        canvasBgAlpha: 0,
        plotBorderThickness: 3,
        plotBorderAlpha: 100,
        usePlotGradientColor: 0,
        plotFillAlpha: 10,
        canvasPadding: 0,
        plotToolText:
          "<div style='line-height: 1.1rem;'>$label<br><b>$dataValue</b></div>"
      },
      data: totalRecoveredArr
    }
  }).render();
}
