import * as d3 from "d3";
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/grouped-bar-chart
function GroupedBarChart(
    data,
    targets, {
        x = (d, i) => i, // given d in data, returns the (ordinal) x-value
        y = (d) => d, // given d in data, returns the (quantitative) y-value
        z = () => 1, // given d in data, returns the (categorical) z-value
        title, // given d in data, returns the title text
        marginTop = 50, // top margin, in pixels
        marginRight = 20, // right margin, in pixels
        marginBottom = 150, // bottom margin, in pixels
        marginLeft = 50, // left margin, in pixels
        width, // outer width, in pixels
        height, // outer height, in pixels
        xDomain, // array of x-values
        xRange = [marginLeft, width - marginRight], // [xmin, xmax]
        xPadding = 0.1, // amount of x-range to reserve to separate groups
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [ymin, ymax]
        zDomain, // array of z-values
        zPadding = 0.05, // amount of x-range to reserve to separate bars
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        colors = ["#2E7CF6", "#82B0FA", "#C0D8FC"], // array of colors
        ref
    } = {}
) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);

    // Compute default domains, and unique the x- and z-domains.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;

    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);
    // Omit any data not present in both the x- and z-domain.

    const I = d3
        .range(X.length)
        .filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
    const xzScale = d3
        .scaleBand(zDomain, [0, xScale.bandwidth()])
        .padding(zPadding);
    const yScale = yType(yDomain, yRange);
    const zScale = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3
        .axisLeft(yScale)
        .tickValues([1, 2, 3, 4, 5, 6])
        .tickFormat((tick) => `NIVÅ ${tick}`);
    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = (i) => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, (d) => d);
        const T = title;
        title = (i) => T(O[i], i, data);
    }
    const svg = d3
        .select(ref)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic; ");

    //sizes
    const strokeWidth = 2;

    const cellSize = (width - marginLeft - marginRight + 6) / 7 - strokeWidth;

    const sideMarginsGroups =
        cellSize - strokeWidth * 2 - xzScale.bandwidth() * 3;
    const innerWidth = width - marginLeft - marginRight + sideMarginsGroups / 2;

    const innerHeight = height - marginBottom - marginTop + 10;
    const cellHeight = 39;
    const barWidth = 25;

    //Background
    const Background = svg
        .append("g")
        .append("rect")
        .attr("fill", "#FFFFFF")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("transform", `translate(${marginLeft}, ${marginTop - 10})`);

    //Bars
    const bar = svg
        .append("g")
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", (i) => xScale(X[i]) + xzScale(Z[i]) + sideMarginsGroups / 2)
        .attr("y", (i) => yScale(Y[i]))
        .attr("width", barWidth)
        .attr("height", (i) => yScale(0) - yScale(Y[i]))
        .attr("fill", (i) => zScale(Z[i]))
        .attr("rx", 2);

    if (title) bar.append("title").text(title);
    //Y- Axis
    const YAxis = svg
        .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call((g) =>
            g.select(".domain").attr("stroke", "#DDDDDD").attr("stroke-width", "2")
        )
        .call((g) =>
            g
            .selectAll(".tick line")
            .attr("stroke-width", "2")
            .attr("stroke", "#DDDDDD")
        )
        .call((g) =>
            g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel)
        );
    YAxis.selectAll(".tick text")
        .attr("font-family", "Roboto, sans-serif")
        .attr("font-weight", "medium")
        .attr("font-size", "12px");

    // YAxis.select(".tick:first-of-type").remove()
    YAxis.select(".domain").remove()

    //X- Axis
    const XAxis = svg
        .append("g")

    .attr("transform", `translate(5,${height - marginBottom})`)
        .call(xAxis)
        .call((g) =>
            g
            .selectAll(".tick")
            .append("rect")
            .attr("height", cellHeight)
            .attr("width", cellSize + strokeWidth)
            .attr("x", -cellSize / 2)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#DDDDDD")
            .attr("stroke-width", "2")
        )
        .call((g) =>
            g.select(".domain").attr("stroke-width", "2").attr("stroke", "#DDDDDD")
        )
        .call((g) =>
            g
            .selectAll(".tick line")
            .attr("y1", 0)
            .attr("y2", -innerHeight)
            .attr("x1", -cellSize / 2)
            .attr("x2", -cellSize / 2)
            .attr("stroke", "#DDDDDD")
            .attr("stroke-width", "2")
        )
        .call((g) => g.selectAll(".tick text").remove())
        .call((g) =>
            g
            .selectAll(".tick")
            .append("text")
            .text((d) => d)
            .attr("fill", "currentColor")
        );
    XAxis.selectAll(".tick text")
        .attr("font-family", "Roboto, sans-serif")
        .attr("font-weight", "medium")
        .attr("font-size", "12px")
        .attr("y", cellHeight / 3)
        .attr("dy", cellHeight / 3);

    XAxis.select(".tick:last-child rect").attr("width", cellSize - (strokeWidth * 2))


    // Referenceline
    const referenceLines = svg.append("g").attr("class", "referenceLines");

    targets.map((target, i) => {
        return referenceLines
            .append("g")
            .attr("transform", `translate(${marginLeft},${yScale(target.niva)})`)
            .append("line")
            .attr("x2", innerWidth)
            .style("stroke", "#86BC24")
            .style("stroke-dasharray", i * 2)
            .style("stroke-width", "2px");
    });
    //Styling
    //RightBorder
    svg
        .append("g")
        .attr("class", "rightBorder")
        .append("line")
        .attr("y1", 0)
        .attr("y2", height - marginBottom)
        .attr("x1", width - marginRight + sideMarginsGroups / 2)
        .attr("x2", width - marginRight + sideMarginsGroups / 2)
        .style("stroke", "#DDDDDD")
        .style("stroke-width", "2px");
    //Legend
    const dots = svg.append("g").attr("class", "dotsLegend");
    dots
        .selectAll("mydots")
        .data(colors)
        .enter()
        .append("circle")
        .attr("cx", 275)
        .attr("cy", function(d, i) {
            return 400 + i * 25;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 5)
        .style("fill", (d) => d);
    // Add one dot in the legend for each name.
    dots
        .selectAll("mylabels")
        .data(zDomain)
        .enter()
        .append("text")
        .attr("x", 285)
        .attr("y", function(d, i) {
            return 400 + i * 25;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "currentColor")
        .text((d) =>
            d === "vår19" ?
            "Vår 19" :
            d === "höst19" ?
            "Höst 19" :
            d === "vinter19" ?
            "Vinter 19/20" :
            ""
        )
        .style("font-size", "9px")
        .style("text-transform", "uppercase")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    const lines = svg.append("g").attr("class", "linesLegend");

    lines
        .selectAll("myTargetLines")
        .data(targets)
        .enter()
        .append("line")
        .attr("x1", 420)
        .attr("x2", 440)
        .attr("y1", function(d, i) {
            return 400 + i * 25;
        })
        .attr("y2", function(d, i) {
            return 400 + i * 25;
        })
        .style("stroke", "#86BC24")
        .style("stroke-dasharray", (d, i) => i * 2)
        .style("stroke-width", 2);
    lines
        .selectAll("myTargetlabels")
        .data(targets)
        .enter()
        .append("text")
        .attr("x", 450)
        .attr("y", function(d, i) {
            return 400 + i * 25;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "currentColor")
        .text((d) => d.name)
        .style("font-size", "9px")
        .style("text-transform", "uppercase")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    const tScale = d3
        .scaleBand(["AVKODNING", "SPRÅKFÖRSTÅELSE", "LÄSFÖRSTÅELSE"], xRange)

    .paddingInner(xPadding);

    var t_axis = d3.axisTop(tScale);

    const TAxis = svg
        .append("g")
        .attr("transform", `translate(0,${marginTop - 10})`)
        .call(t_axis)
        .call((g) => g.select(".domain").remove())
        .call((g) => g.selectAll(".tick line").remove())
        .call((g) =>
            g
            .selectAll(".tick")
            .append("rect")
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#DDDDDD")
            .attr("stroke-width", "2")
            .attr("y", -cellHeight)
            .attr("height", cellHeight)
            .attr("width", (cellSize + strokeWidth) * 2 + strokeWidth)
            .attr("x", -cellSize)
        )
        .call((g) =>
            g
            .select(".tick:nth-of-type(1)")
            .attr("transform", `translate(${cellSize + marginLeft }, 0)`)
        )
        .call((g) =>
            g
            .select(".tick:nth-of-type(2)")
            .attr("transform", `translate(${(cellSize + strokeWidth ) * 3 + marginLeft}, 0)`)
        )
        .call((g) =>
            g
            .select(".tick:last-of-type")
            .attr("transform", `translate(${(cellSize+ strokeWidth ) * 5.5 + marginLeft}, 0)`)
            .select("rect")
            .attr("width", (cellSize) * 3 + strokeWidth)
            .attr("x", -cellSize * 1.5)
        )
        .call((g) => g.selectAll(".tick text").remove())
        .call((g) =>
            g
            .selectAll(".tick")
            .append("text")
            .text((d) => d)
            .attr("fill", "currentColor")
        );
    TAxis.selectAll(".tick text")
        .attr("font-family", "Roboto, sans-serif")
        .attr("font-weight", "medium")
        .attr("font-size", "12px")
        .attr("y", -7)
        .attr("dy", -7)
        .attr("style", "z-index: 20;");

    return Object.assign(svg.node(), { scales: { color: zScale } });
}

export default GroupedBarChart;