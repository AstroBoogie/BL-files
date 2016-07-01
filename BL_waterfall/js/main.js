// sets width and height of svg container
var max_x = $(window).width();
var max_y = 10000;

// adds margins surrounding svg container
var margin = {top: 80, right: 150, bottom: 0, left: 150};
var width = max_x - margin.left - margin.right,
    height = max_y - margin.top - margin.bottom;

// compresses data by a factor of the value
var xCompress = 90;
var yCompress = 20;

// defines the length of the row based on the length of the compressed list within the original fits data
var cropLength;

// distance between each square representation
var gapSize = 2;

var selected;

// creates the line generation function
var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

// loads fits data
d3.json("fits/pyfits.txt", function(data) {
    var dataStore = [];
    var dataMagnified = {};
    var magnifyCounter = -1;
    var magnifyLength;
    var magnifyConditional = true;

    // creates a loop to compress data based on xCompress and yCompress
    var cropCheck = false;
    for (var x = 0; x < data.length; x++) {
        for (var y = 0; y < data[x].length; y++) {
            var item = data[x][y];

            if (y % yCompress == 0 && x % xCompress == 0) {
                dataStore.push(item);

                magnifyCounter++;

                dataMagnified[magnifyCounter] = [];
            }

            dataMagnified[magnifyCounter].push(item);

        }
        if (cropCheck == false) {
            cropCheck = true;
            cropLength = dataStore.length;
        }
    }

    console.log(dataMagnified);
    magnifyLength = dataMagnified["1"].length;

    // console.log("dataStore: " + dataStore.length);
    // console.log(dataMagnified); //every 104 indices, pushes every item rather than only 20, 5408 indices
    // console.log(cropLength);
    // console.log(magnifyLength);

    // defines minimum and maximum value
    var oldmin = 1000000;
    var oldmax = 0;

    // generates the range of values by looping through all values in dataStore
    dataStore.forEach(function (z) {
        if (z > oldmax) {
            oldmax = z;
        }
        if (z < oldmin) {
            oldmin = z;
        }
    });

    var itemQuadrant;

    // creates the svg container
    var svgContainer = d3.select("body").append("svg")
        .attr("width", max_x)
        .attr("height", max_y)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // defines counters to be used to position each svg element
    var xCounter = -1;
    var yCounter = 0;
    var yCounterB = 0;

    var line1Graph;
    var line2Graph;

    // creates the rectangle svg elements based on dataStore data
    var rectangles = svgContainer.selectAll("svg")
        .data(dataStore)
        .enter()
        .append("rect")
        .attr("preserveAspectRatio", "none")

        // modifies x for each square
        .attr("x", function () {
            xCounter = xCounter + 1;
            if (xCounter == cropLength) {
                xCounter = 0;
            }
            return xCounter * ((width / cropLength) - ((10 + gapSize) / cropLength));
        })

        //modifies y for each square
        .attr("y", function () {
            if (yCounterB % (cropLength) == 0 && yCounterB != 0) {
                yCounter = yCounter + 1;
            }
            yCounterB = yCounterB + 1;
            return yCounter * ((width / cropLength) - ((10 + gapSize) / cropLength));
        })

        //modifies height of square based on (screen width / length of row) - spacing between gaps
        .attr("height", function () {
            return (width / cropLength) - gapSize;
        })

        //modifies width of square
        .attr("width", function () {
            return (width / cropLength) - gapSize;
        })

        //manipulates the color of the square based on data value
        .style("fill", function(d) {
            return "rgb(" + 255 + "," + (d - 1000) + "," + 0 + ")";
        })

        // creates interaction upon clicking the square
        .on("click", function (d, i) {

            console.log(dataMagnified[i]);

            selected = i;

            var magnifyCreation = function () {
                exampleBox.remove();
                exampleBox = svgContainer.selectAll("svg")
                    .data(dataMagnified[selected])
                    .enter()
                    .append("rect")
                    .attr("width", ((width / cropLength) - gapSize) * 2)
                    .attr("height", ((width / cropLength) - gapSize) * 2)
                    .attr("x", function (d, i) {
                        return i * 40;
                    })
                    .style("fill", "rgb(100, 100, 255)");
            };

            // removes old lines drawn except the first click (when they're undefined)
            if (line1Graph != undefined) {
                line1Graph.remove();
                line2Graph.remove();
            }

            // defines the square that's clicked as a d3 selection
            var sqr = d3.select(this);

            // scales

            // updates the tooltip upon click
            tooltip.style("opacity", 0.7)

                // changes the x position depending on the position of the mouse click
                .attr("x", function (d, i) {
                    if (d3.event.pageX/max_x - 0.01 >= 0.5) {
                        magnifyCreation();
                        return -(width * 0.1);
                    }
                    else {
                        magnifyCreation();
                        return width * 0.7;
                    }
                })

                // changes the y position depending on the index of the clicked element
                .attr("y", function () {
                    if (i > (dataStore.length)/2) {
                        return -(dataStore.length/cropLength);
                    }
                    else {
                        return (dataStore.length/cropLength * 6);
                    }
                });

                // creates variables to represent the x and y positions of the clicked square
                var sqr1X = 1 + sqr[0][0]["x"]["animVal"].value;
                var sqr2X = sqr1X + ((width / cropLength) - gapSize) - 1;
                var sqr1Y = sqr[0][0]["y"]["animVal"].value;

                // creates variables to represent the x and y positions of the tooltip after repositioning
                var rect1X = tooltip[0][0]["x"]["animVal"].value;
                var rect2X = rect1X + tooltip[0][0]["width"]["animVal"].value;
                var rect1Y = tooltip[0][0]["y"]["animVal"].value;

                // creates lines start and end positions
                var line1Data = [{"x": sqr1X, "y": sqr1Y }, {"x": rect1X, "y": rect1Y}];
                var line2Data = [{"x": sqr2X, "y": sqr1Y }, {"x": rect2X, "y": rect1Y}];

            // generates a path based on line data as an argument of the line function
            line1Graph = svgContainer.append("path")
                .attr("d", lineFunction(line1Data))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");

            line2Graph = svgContainer.append("path")
                .attr("d", lineFunction(line2Data))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        })

        // code to expand or detract rectangles based on mouse events
        .on("mouseover", function (d, i) {
            var sqr = d3.select(this);
            var rectsize = (width / cropLength) - gapSize;

            var growRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {
                        return rectsize * 0.5;
                    })
                    .attr("height", function () {
                        return rectsize * 0.5;
                    });
            };

            //defines adjacent rectangles to current rectangle
            var top;
            var bottom;
            var left;
            var right;

            // applies top rectangle attributes
            if (dataStore.length > cropLength) {
                top = d3.select(rectangles[0][i - cropLength]);
                top.attr("transform", function () {
                        return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.075) + ")"
                    });
                growRect(top);
            }

            // applies bottom rectangle attributes
            if (dataStore.length - i > cropLength) {
                bottom = d3.select(rectangles[0][i + cropLength]);
                bottom.attr("transform", function () {
                    return "translate(" + (rectsize * 0.25) + "," + (rectsize * 0.425) + ")"
                });
                growRect(bottom);
            }

            // applies left rectangle attributes
            if (i % cropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                left.attr("transform", function () {
                    return "translate(" + (rectsize * 0.075) + "," + (rectsize * 0.25) + ")"
                });
                growRect(left);
            }

            // applies right rectangle attributes
            if (i % cropLength < (cropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                right
                    .attr("transform", function () {
                    return "translate(" + (rectsize * 0.425) + "," + (rectsize * 0.25) + ")"
                });
                growRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("transform", function () {
                    return "translate(" + (-1 * (rectsize / 2)) + "," + (-1 * (rectsize / 2)) + ")"
                })
                .attr("width", function () {
                    return rectsize * 2;
                })
                .attr("height", function () {
                    return rectsize * 2;
                });
        })

        // restores square size and positions upon the mouse leaving the element
        .on("mouseout", function (d, i) {
            var sqr = d3.select(this);
            var rectsize = (width / cropLength) - gapSize;

            // function that shrinks the rectangle
            var shrinkRect = function (rectangle) {
                rectangle.transition()
                    .duration(200)
                    .attr("width", function () {

                        return rectsize;
                    })
                    .attr("height", function () {
                        return rectsize;
                    })
                    .attr("transform", function () {
                        return "translate(" + 0 + "," + 0 + ")"
                    });
            };

            var top;
            var bottom;
            var left;
            var right;

            if (dataStore.length > cropLength) {
                top = d3.select(rectangles[0][i - cropLength]);
                shrinkRect(top);
            }
            if (dataStore.length - i > cropLength) {
                bottom = d3.select(rectangles[0][i + cropLength]);
                shrinkRect(bottom);
            }
            if (i % cropLength > 0) {
                left = d3.select(rectangles[0][i - 1]);
                shrinkRect(left);
            }
            if (i % cropLength < (cropLength - 1)) {
                right = d3.select(rectangles[0][i + 1]);
                shrinkRect(right);
            }

            sqr.transition()
                .duration(200)
                .attr("width", function () {
                    return rectsize;
                })
                .attr("height", function () {
                    return rectsize;
                })
                .attr("transform", function () {
                    return "translate(" + 0 + "," + 0 + ")"
                });


        });

    // var exampleContainer = d3.select("body").append("svg")
    //     .attr("width", 100)
    //     .attr("height", 100);

    // console.log(dataMagnified["1"]);
    // var boxWidth;

    var exampleBox = svgContainer.selectAll("svg")
        .data(dataMagnified["1"])
        .enter()
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", function (d, i) {
            return i * 20;
        })
        .style("fill", "rgb(100, 100, 255)");

    // boxWidth = exampleBox[0][0]["width"]["animVal"]["value"];

    // var tooltipContainer = d3.select("body").append("svg")
    //     .attr("width", $(window).width())
    //     .attr("height", $(window).height())
    //     .attr("x", 0)
    //     .attr("y", 0);
    //
    // var testArray = [1, 2, 3, 4];
    //
    // // creates the tooltip object which contains pixel data with a higher resolution
    // var tooltip = tooltipContainer.selectAll("svg")
    //     .data(testArray)
    //     .enter()
    //     .append("rect")
    //     .attr("x", function (d, i) {
    //         return i * 10;
    //         console.log("orange");
    //     })
    //     .attr("y", function (d, i) {
    //         return i * 10;
    //     })
    //     .attr("width", 5)
    //     .attr("height", 5)
    //     .style("opacity", 0)
    //     .style("fill", "rgb(100, 100, 255)");
    // creates the tooltip object which contains pixel data with a higher resolution

    var tooltip = svgContainer.append("rect")
        .attr("x", -10000)
        .attr("y", -10000)
        .attr("width", (max_x / 3.5))
        .attr("height", (max_x / 3.5) / 1.7)
        .style("opacity", 0);
});