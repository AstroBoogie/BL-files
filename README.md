How BL | Starmap works
=============

The target star map is a dynamic mollweide projection of any star catalog. The projection allow the user to easily navigate the stars on the projection and access the Simbad page associated with it. In addition, it allows filtering of the spectral type of the stars, representation of any star’s name and distance in parsecs, an a normalized scaling of all the star’s visible spectrums. If this is a catalog you are observing, you can input the observation dates allowing you to navigate to the stars that are going to be observed within a specified date range.

####Parsing the .csv data

To parse the data to retrieve all the relevant data values for d3 manipulation, I created two functions to convert the right ascension and declination into float data types. This allowed me to later create filters and transformations on the DOM objects such as the spectral type filter and apparent magnitude scaling.

####Representing the RA and DEC

 To display the right ascension and declination on the mollweide projection, I used an ellipse function to plot every point on an ellipse with the modified right ascension and real declination values.

####Generating the observation schedule

 Within the .csv file exists the dates of most star observations. Using moment.js, I was easily able to treat all dates as variations of a single data type. Using ion.rangeSlider.js, I was then further able to filter the associated observation dates into the range slider.

Using BL | Starmap
=============

The BL Starmap is a modular Javascript visualization which can display any star catalog on any website. This allows astronomers to display star catalogs on a website for users to interact with dynamically. 

Ways to install the BL Starmap to your web server are discussed below.

##Configuring target_map.js

To have the starmap read your star catalog, it has to be in a readable format. To configure a .csv file that the code can parse, it must be organized with the following headers:

- Name
- RA
- DEC
- Vmag
- Sp.Type
- dist (pc)
- ObsDate

Once the file is properly formatted, add it the directory:

`BL_starmap/csv_data`

After that, change the variable called starCatalog on line 2 of target_map.js to the directory and name of your csv file.

##Adding the Starmap to your web server

Add the directory into your web server and place the following iframe attribute where you would like the star map to appear:

`iframe src="/directory/starmap" width="" height="" frameborder="0" scrolling="no">`

Adjust the width and height along with change the src to the directory of the star map. Additional documentation on how to handle iframes can be found [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).

In addition, you can adjust colors using the main.css file, changing the mollweide projection image and replacing the button images.

How BL | APF Data works
=============

The APF (Automated Planet Finder) data visualization allows the user to interact with .fits data from any source, despite the name of the file. This visualization allows easy access between raw optical data and reduced optical data (which can be obtained from [this tutorial](https://github.com/UCBerkeleySETI/breakthrough/blob/master/APF/Tutorial/Tutorial%20-%20Work%20With%20APF%20Data%20%26%20Search%20for%20ETI%20Current.ipynb)). Within the raw APF data exists a compressed set of data points with magnified data points within each of them. The same goes for the reduced APF data, however it is only scaled horizontally rather than vertically. In addition, the reduced APF data has a 2-dimensional line graph representing intensity as a function of wavelength.

####Generating raw and reduced data

To generate the data, I used a Python script which used pyfits to compile the data as an array of arrays, then I used json to convert that data into json to be read by Javascript. I then exported it as a .txt file and grabbed it using d3’s built in json function.

####Drawing the main graph

Drawing the data for each of the graphs required different data manipulation techniques. For the primary graph of both the raw and reduced data (largest graph in the image), I parsed the array into individual items, iterated through them within increments with a loop, and assigned the items to an array. I then looped through the x position of each of these elements to draw them into rows based on the original array lengths.

####Drawing the 2-dimensional line graph

Drawing this line for the reduced data was done by pushing a magnified data point’s index as the x-value and it’s contained value (intensity) as the y-value of a dictionary. I then created a d3 function to plot lines between these points onto a graph. After that, I converted their indices into wavelengths using a previously generated file which contained a table of wavelengths associated with APF data pixel position.