package com.example.hoanglong.googlemaptest;

public class PointData {
    private long id;
    private double longtitude;
    private double latitude;
    private double waterValue;

    public PointData(long id, double waterValue, double longtitude, double latitude) {
        this.id = id;
        this.longtitude = longtitude;
        this.latitude = latitude;
        this.waterValue = waterValue;
    }

    public long getId() {
        return id;
    }

    public double getLongtitude() {
        return longtitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getWaterValue() {
        return waterValue;
    }

    public int getXCoordinate() {
        return this.getColNumberInDataSet();
    }

    public int getYCoordinate() {
       return this.getRowNumberInDataSet();
    }

    public int getColNumberInDataSet() {
        return (int) (this.id % (CSVReader.DATA_WIDTH+1));
    }

    public int getRowNumberInDataSet() {
        return Math.round(this.id / (CSVReader.DATA_WIDTH+1));
    }

    public int getXPixel() {
        return (int)Math.round(this.getXCoordinate()*1.0f / MapsActivity.SCALE_X) + MapsActivity.COOR_X;
    }

    public int getYPixel() {
        return (int)Math.round(this.getYCoordinate()*1.0f / MapsActivity.SCALE_Y) + MapsActivity.COOR_Y;
    }

    /**
     * Calculate distance betweeen this data point and the other GEO point in km
     * @param latitude
     * @param longtitude
     * @return
     */
    public double distance(double latitude, double longtitude) {
        return (latitude-this.latitude)*(latitude-this.latitude)+(longtitude-this.longtitude)*(longtitude-this.longtitude);
    }
}
