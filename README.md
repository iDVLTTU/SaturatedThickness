## STOAViz: Visualizing Saturated Thickness of Ogallala Aquifier
STOAViz is a visual analytics tool for analyzing the saturated thickness of the \theOgallala{} aquifer.
The saturated thicknesses are monitored by sensors integrated on wells distributed on a vast geographic area.
Our analytics application also captures the trends and patterns of water in the Southern High Plains Aquifer of Texas.

Demo video of STOAViz
http://myweb.ttu.edu/longhngu/resources/demo-saturated-thickness.mp4

Online application
https://idatavisualizationlab.github.io/SaturatedThickness/

Our STOAViz contour map in three consecutive years 2011, 2012 and 2013

![ScreenShot](https://github.com/iDataVisualizationLab/SaturatedThickness/blob/master/figures/contour3years.png)

The data is provide by the [Water Resource Center](https://www.depts.ttu.edu/waterresources/) at TTU.

## User Story
Our domain analyst wants to see wells that have high sudden saturated thickness increase. He will go to the tool, from Control panel, for the **Well radius by**
option, he chooses **Sudden increase**. Just one selection, he immediately gets list of wells with highest sudden saturated thickness increase.
Then he wants to see time period of a particular well that has this change, he just needs to do mouse over a well on time series chart legend.
And the Comparison graph will appear with two points flickering telling the period of this big increase.
He makes mouse over each point, the date of this measurement and its saturated thickness value will be shown up.

## GLEAMM POSTER SHOWCASE
https://techannounce.ttu.edu/Client/ViewMessage.aspx?MsgId=206458

![ScreenShot](https://github.com/iDataVisualizationLab/SaturatedThickness/blob/master/figures/jsVersion.png)

Prizes and recognition:

1st Place $2000 2nd Place $1000 3rd & 4th Place $500 each
All winners will be publicized in the daily TechAnnounce, and automatically entered into the 2017 Spark Fund competition with awards reaching as much as $50,000!

Posters are due no later than April 1st, 2017.

## References

[Texas Water Department Board](http://www.twdb.texas.gov/index.asp) 

Tuan Dang and Leland Wilkinson. *TimeExplorer: Similarity Search Time Series by Their Signatures*.
[PDF](http://www.myweb.ttu.edu/tnhondan/file/TimeExplorer.pdf)

Terrain: https://threejs.org/examples/#webgl_terrain_dynamic
Particles: https://threejs.org/examples/#webgl_buffergeometry_instancing_billboards
Points: https://threejs.org/examples/#webgl_buffergeometry_points_interleaved
Points: https://threejs.org/examples/#webgl_custom_attributes_points
Multiple Pyramics: https://threejs.org/examples/#misc_controls_orbit
Particles on floor: https://threejs.org/examples/#canvas_particles_floor
Waves: https://threejs.org/examples/#canvas_particles_waves

https://tommy-dang.github.io/WaterLevel/Contour/

Related project from CS5331: Visualization and Visual Analytics - Fall 2016. [Demo](http://myweb.ttu.edu/jataber/unemployment/) [Github](https://github.com/jmtaber129/unemployment-visualization)
