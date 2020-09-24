const svg = d3.select("#chart").append("svg");
var margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = 1150 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;
svg
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right);
const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left} ,${margin.top})`);

var x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
var x1 = d3.scaleBand().padding(0.05);

var y = d3.scaleLinear().rangeRound([height, 0]);
var z = d3
  .scaleOrdinal()
  .range([
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00",
  ]);

var dataToUpdate = data;

var columns = data.map((d) => d.categorie);
var rateNames = data[0].values.map(function (d) {
  return d.rate;
});

x0.domain(columns);
x1.domain(rateNames).rangeRound([0, x0.bandwidth()]);
y.domain([
  0,
  d3.max(data, (categorie) => d3.max(categorie.values, (d) => d.value)),
]);
z.domain(rateNames);

g.append("g")
  .transition()
  .duration(200)
  .attr("class", "x axis")
  .call(d3.axisBottom(x0))
  .attr("transform", `translate(0 ,${height})`);
// .transition();

g.append("g")
  // .transition()
  // .duration(600)
  .attr("class", "y axis")
  .call(d3.axisLeft(y));

g.append("text")
  .text("value")
  // .transition()
  .attr("transform", `rotate(-90)`)
  .attr("y", 10)
  .attr("x", -30);

renderChart();
function renderChart() {
  var newDomain = dataToUpdate[0].values.map(function (d) {
    return d.rate;
  });
  x1.domain(newDomain);

  let v = g.selectAll(".slice").data(dataToUpdate);
  var slice = v
    .enter()
    .append("g")
    .attr("class", "slice")
    .merge(v)
    .attr("transform", (d) => `translate(${x0(d.categorie)} ,0)`);
  v.exit().remove();

  var u = slice.selectAll("rect").data((d) => d.values);
  u.enter()
    .append("rect")
    .attr("y", height)
    .merge(u)
    .attr("x", (d) => x1(d.rate))
    .transition()
    .attr("width", x1.bandwidth())

    .ease(d3.easeSin)
    .duration(2500)
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => height - y(d.value))
    .attr("fill", (d) => z(d.rate));
  u.exit().remove();
}

renderLegend();
function renderLegend() {
  let allLabels = data[0].values;
  console.log(allLabels);
  let isLabelVisible = allLabels.map((element) => {
    return dataToUpdate[0].values.indexOf(element) === -1 ? false : true;
  });

  let u = g.selectAll(".legend").data(allLabels, (d) => {
    return Math.random();
  });

  var legend = u
    .enter()
    .append("g")
    .attr("class", "legend")
    .merge(u)
    .on("click", (d, e) => {
      update(d, e);
    })
    .attr("transform", (d, i) => `translate(${width - 70} ,${i * 20} )`);
  u.exit().remove();

  var boxes = legend
    .append("rect")
    .merge(u)
    // .transition()
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d, i) => z(d.rate))
    .attr("stroke", (d, i) => (isLabelVisible[i] ? "none" : "black"))
    .attr("stroke-width", "2px")
    .attr("y", (d, i) => i * 20);

  legend
    .append("text")
    // .transition()
    .text((d) => d.rate)
    .attr("transform", (d, i) => `translate(0 , ${i * 20})`)
    .attr("dy", 12)
    .attr("x", 30);
}

function update(event, eventData) {
  if (dataToUpdate[0].values.indexOf(eventData) === -1) {
    let newData = [];
    let insetAtIndex = 0;
    dataToUpdate.forEach((element, index) => {
      let originalItem = data[index].values;
      let newItem = originalItem.find((value, index) => {
        if (value.rate == eventData.rate) {
          insetAtIndex = index;
        }
        return value.rate == eventData.rate;
      });
      element.values.splice(insetAtIndex, 0, newItem);
      newData.push(element);
    });
    dataToUpdate = newData;
  } else {
    //remove item
    let newData = [];
    dataToUpdate.forEach((element) => {
      let newValues = element.values.filter((ele) => {
        return ele.rate !== eventData.rate;
      });
      let newDataBlock = { ...element, values: newValues };
      newData.push(newDataBlock);
    });
    dataToUpdate = newData;
  }
  renderChart();
  renderLegend();
}

setInterval(() => {
  dataToUpdate.forEach((element) => {
    element.values.forEach((item) => {
      item.value = Math.random() * 20;
    });
  });
  renderChart();
  renderLegend();
}, 3000);
