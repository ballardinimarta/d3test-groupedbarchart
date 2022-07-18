import * as d3 from "d3";
import { useEffect, useRef } from "react";
import GroupedBarChart from "./GroupedBarChart";
import data from "./GroupedBarChartData.json";

const MyGraph = () => {
    let colors = ["#C0D8FC", "#82B0FA", "#2E7CF6"]; // array of colors
    const terminer = data.map((d) => d.termin);
    const termin = [...new Set(terminer)];
    const ref = useRef(null);
    useEffect(() => {
        GroupedBarChart(
            data, [
                { name: "mål åk1", niva: 3 },
                { name: "mål åk2", niva: 4 },
                { name: "mål åk3", niva: 5 }
            ], {
                x: (d) => d.name,
                y: (d) => d.niva,
                z: (d) => d.termin,
                xDomain: d3
                    .groupSort(
                        data,
                        (D) => d3.sum(D, (d) => d),
                        (d) => d.name
                    )
                    .slice(0, 7), // top 6
                zDomain: termin,
                colors: colors,
                width: 800,
                height: 476,
                ref: ref.current
            }
        );
    }, []);

    return <svg ref = { ref }
    />;
};

export default MyGraph;