$(document).ready();

//entire set of data from csv file
var allData;

//all data within range slider
var rangeData;

//manipulated set of data based on stars being observed (see rangeData)
var tempData;

// defines click status of legend to be used by legend and slider
var isClicked = false;

//margins of entire svg window
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = window.innerWidth,
    height = window.innerHeight;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

var imgHeight = 0;

//ensures all files load properly
setTimeout(function () {
    imgHeight = $('#mollweideId').height();

    //normalizes Vmag
    var normalize_value = function (oldvalue, oldmin, oldmax, newmin, newmax) {
        return (newmax - newmin) / (oldmax - oldmin) * (oldvalue - oldmax) + newmax;
    };

    // setup x
    var xValue = function (d) {
            return d.RA;
        }, // data -> value
        xScale = d3.scale.linear().range([0, (window.innerWidth * 0.74)]), // value -> display
        xMap = function (d) {
            return xScale(xValue(d));
        }; // data -> display

    // setup y
    var yValue = function (d) {
            return d.DEC; //switch back to declination
        }, // data -> value
        yScale = d3.scale.linear().range([(imgHeight * 0.592), 0]), // value -> display
        yMap = function (d) {
            return yScale(yValue(d));
        }; // data -> display

    //checks if char is alphabetic
    var isAlpha = function (xStr) {
        var regEx = /[a-zA-Z]/;
        if (xStr.match(regEx) == null) {
            return false;
        }
        else {
            return true;
        }
    };

    // setup fill color
    var cValue = function (d) {
        if (isAlpha(d["Sp.Type"].substring(0, 1)) == true) {
            return d["Sp.Type"].substring(0, 1);
        }
        else {
            return "Unknown";
        }
    };

    //associative array for dots and legend to utilize color values
    color = {
        B: "#699dd7",
        A: "#dfefef",
        F: "#70e49e",
        G: "#c7e14b",
        K: "#d2ba5b",
        M: "#c25469",
        Unknown: "#ffffff"
    };

    // find vmag
    var nvMag = function (d) {
        return normalizedVmag[d["Vmag"].toString()];
    };

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("id", "svgMain")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "rgb(250,250,250)")
        .style("padding", "10px")
        .style("height", "auto")
        .style("width", "150px")
        .style("box-shadow", "3px 3px 5px rgba(0,0,0,0.5)");

    // recreates dot map with object array argument val
    function update(val) {
        var dots = svg.selectAll(".dot")
            .data(val)
            .attr("class", function (d) {
                var type = "";
                type = cValue(d);
                return "dot " + type;
            })
            .attr("star-name", function (d) {
                return d["Name"];
            })
            .attr("r", window.innerWidth / 325)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .attr("transform", "translate(" + window.innerWidth * 0.2 + ", " + window.innerHeight * 0.144 + ")")
            .style("fill", function (d) {
                return color[cValue(d)];
            })
            // opens simbad page associated with star clicked on mollweide proj.
            .on("click", function (d) {
                openInNewTab("http://simbad.u-strasbg.fr/simbad/sim-id?Ident=" + d.Name);
            })
            //displays tooltip
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html("Name: " + d.Name + "</br>" + d["dist (pc)"] + " parsecs away" + "</br>" + "<div class='highlightedText'>Click to go to Simbad</div>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    //function to open url in new tab
    function openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

        //creates circles on mollweide proj.
        dots.enter().append("circle")
        // .attr("class", "dot")
            .attr("class", function (d) {
                var type = "";
                type = cValue(d);
                return "dot " + type;
            })
            .attr("star-name", function (d) {
                return d["Name"];
            })
            .attr("r", window.innerWidth / 325)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .attr("transform", "translate(" + window.innerWidth * 0.2 + ", " + window.innerHeight * 0.144 + ")")
            .style("fill", function (d) {
                return color[cValue(d)];
            })
            .on("click", function (d) {
                openInNewTab("http://simbad.u-strasbg.fr/simbad/sim-id?Ident=" + d.Name);
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html("Name: " + d.Name + "</br>" + d["dist (pc)"] + " parsecs away" + "</br>" + "<div class='highlightedText'>Click to go to Simbad</div>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // draw radius button
        var vmag_button = d3.selectAll(".vmag_button")
            .on("mouseover", function (d, i) {// console.log(current);

                var dots = d3.selectAll(".dot");
                $(".dot1").css("opacity", 1);
                $(".vmag_button").css("opacity", 1);

                dots.transition()
                    .duration(200)
                    .attr("r", nvMag)
            })
            .on("mouseout", function () {
                $(".dot1").css("opacity", 0.5);
                $(".vmag_button").css("opacity", 0.5);

                d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .attr("r", window.innerWidth / 325)
            });

        // retrieves color keys and their value (see color associative array)
        color_array = Object.keys(color).map(function (key) {
            return color[key]
        });

        // filter clicked for mouseover, clicked, and out relation

        var legendFilter = undefined;

        //draws legend
        var legend = svg.selectAll(".legend")
            .data(color_array)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            })

            .on("mouseover", function (d) {
                if (isClicked == false) {
                    var current = Object.getOwnPropertyNames(color)[color_array.indexOf(d)];
                    if (showingAll == false) {
                        tempData = observed_stars;
                    }
                    else {
                        tempData = allData;
                    }
                    tempData = tempData.filter(function (d) {
                        if (d["Sp.Type"].substring(0, 1) != "") {
                            return (d["Sp.Type"].substring(0, 1) == current);
                        }
                        else {
                            return "Unknown" == current;
                        }
                    });
                    update(tempData);
                }
            })

            .on("mouseout", function () {
                if (isClicked == false) {
                    if (showingAll == false) {
                        update(observed_stars);
                    }
                    else {
                        update(allData);
                    }
                }
            })

            .on("click", function (d, i) {
                var current = Object.getOwnPropertyNames(color)[color_array.indexOf(d)];
                legendFilter = legendFilter != current ? current : undefined;
                
                if (legendFilter != undefined) {
                    isClicked = true;

                    if (showingAll == false) {
                        tempData = observed_stars;
                    }
                    else {
                        tempData = allData;
                    }
                    // console.log(tempData);
                    tempData = tempData.filter(function(d) {
                        // console.log(d["Sp.Type"].substring(0, 1));
                        return (d["Sp.Type"].substring(0, 1) == current);
                    });
                    update(tempData);
                } else {
                    isClicked = false;

                    if (showingAll == false) {
                        update(rangeData);
                    }
                    else {
                        update(allData);
                    }
                }
            });


        // draw legend colored rectangles
        legend.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("transform", "translate(22, 38)")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0)
            .style("fill", function (d) {
                return d;
            });
        // console.log(Object.getOwnPropertyNames(color));
        // console.log(color_array.length)

        // draw legend text
        legend.append("text")
            .attr("x", 40)
            .attr("y", 44)
            .attr("font-size", "12px")
            // .attr("opacity", 0.5)
            .attr("dy", ".50em")
            .style("font-weight", "bold")
            .style("text-anchor", "start")
            .style("fill", "white")
            .text(function (d) {
                // console.log(Object.getOwnPropertyNames(color)[color_array.indexOf(d)]);
                return Object.getOwnPropertyNames(color)[color_array.indexOf(d)];
            });

        dots.exit().remove();

    }

// load csv data
    d3.csv("csv_data/BL_star_targets_all_sky.csv", function (error, data) { //callback to load csv data first then do function
        // change string (from CSV) into number format
        var vmin = 1000000000000000000;
        var vmax = 0;

        // creates array of the names of all the stars to be used associatively
        var starNames = [];

        // defines allData
        allData = data;

        data.forEach(function (d) {
            d["Vmag"] = parseFloat(d["Vmag"]) * -1;

            starNames.push(d["Name"]);

            // parses declination and right ascension to be used as floats from radians
            var dec_array = d.DEC.split(" ");
            if (parseFloat(d.DEC[0]) >= 0) {
                d.DEC = parseFloat(dec_array[0]) + (parseFloat(dec_array[1]) * 1 / 60) + (parseFloat(dec_array[1]) * 1 / 3600);
            }
            else {
                d.DEC = parseFloat(dec_array[0]) - (parseFloat(dec_array[1]) * 1 / 60) - (parseFloat(dec_array[2]) * 1 / 3600);
            }

            var ra_array = d.RA.split(" ");

            d.RA = parseFloat(ra_array[0]) + (parseFloat(ra_array[1]) * 1 / 60) + (parseFloat(ra_array[2]) * 1 / 3600);

            if (d.RA - 12 != 0) {
                if (d.RA - 12 > 0) {
                    d.RA = (239 / 360) * (1080 + Math.sqrt((Math.pow(d.DEC, 2)) * (-(Math.pow(d.RA, 2))) + 24 * (Math.pow(d.DEC, 2)) * d.RA - 144 * (Math.pow(d.DEC, 2)) + 8100 * (Math.pow(d.RA, 2)) - 194400 * d.RA + 1166400));
                }
                else {
                    d.RA = (239 / 360) * (1080 - Math.sqrt((Math.pow(d.DEC, 2)) * (-(Math.pow(d.RA, 2))) + 24 * (Math.pow(d.DEC, 2)) * d.RA - 144 * (Math.pow(d.DEC, 2)) + 8100 * (Math.pow(d.RA, 2)) - 194400 * d.RA + 1166400));
                }
            }
            else {
                d.RA = (0 + 717);
            }
            
            //retrieves min and max vmag values

            if (d["Vmag"] < vmin && d["Vmag"] != 0) {
                vmin = d["Vmag"];
            }

            if (d["Vmag"] > vmax) {
                vmax = d["Vmag"];
            }
        });

        //creates array to normalize vmag values
        normalizedVmag = new Array();
        data.forEach(function (d) {

            //normalize dot values
            normalizedVmag[d["Vmag"].toString()] = (normalize_value(parseFloat(d["Vmag"]), vmin, vmax, window.innerWidth / 1000, window.innerWidth / 100));
        });

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
        yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

        update(data);

        schedule_array = [];

        observed_stars = [];

        // var now = moment();
        var fifteenDaysAgo = moment().subtract(15, "days").valueOf(); //In unix time (milliseconds since 1970)
        var fifteenDaysFuture = moment().add(15, "days").valueOf();

        var smin = 999999999;
        var smax = 0;
        
        data.forEach(function (d) {
            schedule_array.push(d);

            if (parseFloat(d["ObsDate"]) < smin) {
                smin = d["ObsDate"];
                // console.log(smin);
            }
            if (parseFloat(d["ObsDate"]) > smax) {
                smax = d["ObsDate"];
                // console.log(smax);
            }
        });
        
        //draws range Slider using jQuery and ion.rangeSlider
        $("#range").ionRangeSlider({
            hide_min_max: true,
            keyboard: true,
            min: fifteenDaysAgo,
            max: fifteenDaysFuture,
            from: fifteenDaysAgo,
            to: fifteenDaysFuture,
            type: 'int',
            step: 86400000, // 1 day in milliseconds
            grid: true,
            prettify: function (value) {
                return moment(value).format("MM/DD/YYYY");
            },
            onStart: function (c) {
                var fromvalue = moment(c["from"]).format("MM/DD/YYYY");
                var tovalue = moment(c["to"]).format("MM/DD/YYYY");
                observed_stars = [];
                allData.forEach(function (d) {
                    if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                        observed_stars.push(d);
                        // console.log(observed_stars);
                    }
                });
                rangeData = observed_stars;

            },
            onChange: function (c) {

                crossData = [];
                var fromvalue = moment(c["from"]).format("MM/DD/YYYY");
                var tovalue = moment(c["to"]).format("MM/DD/YYYY");
                observed_stars = [];

                if (isClicked == false) {
                    allData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;

                    update(observed_stars);
                }
                else {
                    tempData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;

                    update(observed_stars);
                }
            }
        });
    });
    
    //jquery functions to dynamically manipulate range slider and values it affects
    $(".range-slider").hide();
    $(".obs_form").hide();
    $(".obs_submit").hide();

    showingAll = true;
    $(".obs_button").on("click", function(e) {
        e.preventDefault(); //This prevents forms from submitting or links from following (like it'll make an <a> tag not navigate to another page
        $(".range-slider").fadeToggle("fast", "swing");
        $(".obs_form").fadeToggle("fast", "swing");
        $(".obs_submit").fadeToggle("fast", "swing");
        if (showingAll === true){
            update(observed_stars);
            showingAll = false;
            $(".dot2").css("opacity", 1);
            $(".obs_button").css("opacity", 1);
            $(".obs_submit").css("opacity", 1);

        }
        else {
            update(allData);
            showingAll = true;
            $(".dot2").css("opacity", 0.5);
            $(".obs_button").css("opacity", 0.5);
            $(".obs_submit").css("opacity", 1);

        }
        
        //jquery has easy value access for inputs.
        //var val = $(".form-input").value() // use this to grab the mmddyyyy
    });

    // updates projection and slider based on inputted selected date
    $(".obs_submit").on("click", function () {
        var $inputs = $('.obs_form :input');

        values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();
        });

        newDate = (values["mm"] + "/" + values["dd"] + "/" + values["yyyy"]);

        var newfifteenDaysAgo = moment(newDate).subtract(15, "days").valueOf(); //In unix time (milliseconds since 1970)
        var newfifteenDaysFuture = moment(newDate).add(15, "days").valueOf();
        //

        observed_stars = [];

        if (isClicked == false) {
            allData.forEach(function (d) {
                if (moment(d.ObsDate).isAfter(newfifteenDaysAgo) && moment(d.ObsDate).isBefore(newfifteenDaysFuture)) {
                    observed_stars.push(d);
                }
            });
        }
        else {
            tempData.forEach(function (d) {
                if (moment(d.ObsDate).isAfter(newfifteenDaysAgo) && moment(d.ObsDate).isBefore(newfifteenDaysFuture)) {
                    observed_stars.push(d);
                }
            });
        }

        update(observed_stars);

        //defines ionRangeSlider
        var slider = $("#range").data("ionRangeSlider");

        slider.update({
            hide_min_max: true,
            keyboard: true,
            min: newfifteenDaysAgo,
            max: newfifteenDaysFuture,
            from: newfifteenDaysAgo,
            to: newfifteenDaysFuture,
            type: 'int',
            step: 86400000, // 1 day in milliseconds
            grid: true,
            prettify: function (value) {
                return moment(value).format("MM/DD/YYYY");
            },
            onStart: function (c) {
                var fromvalue = moment(c["from"]).format("MM/DD/YYYY");
                var tovalue = moment(c["to"]).format("MM/DD/YYYY");
                observed_stars = [];
                if (isClicked == false) {
                    allData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;
                }
                else {
                    tempData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;
                }

            },
            onChange: function (c) {

                crossData = [];
                var fromvalue = moment(c["from"]).format("MM/DD/YYYY");
                var tovalue = moment(c["to"]).format("MM/DD/YYYY");
                observed_stars = [];

                if (isClicked == false) {
                    allData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;

                    update(observed_stars);
                }
                else {
                    tempData.forEach(function (d) {
                        if (moment(d.ObsDate).isAfter(fromvalue) && moment(d.ObsDate).isBefore(tovalue)) {
                            observed_stars.push(d);
                        }
                        if ($.inArray(d, observed_stars) !== -1) {
                            crossData.push(d);
                        }
                    });

                    rangeData = observed_stars;

                    update(observed_stars);
                }


            }
        });
    });


}, 0);