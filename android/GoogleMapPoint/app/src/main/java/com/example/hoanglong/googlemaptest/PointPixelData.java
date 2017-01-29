package com.example.hoanglong.googlemaptest;

public class PointPixelData {
    private long id;
    private double waterValue;
    private int row;
    private int col;


    public PointPixelData(long id, double waterValue) {
        this.id = id;
        this.waterValue = waterValue;
    }

    public long getId() {
        return id;
    }

    public double getWaterValue() {
        return waterValue;
    }

    public int getRow() {
        return row;
    }

    public int getYDp() {
        return CoordUntil.getYDp(this.row);
    }

    public int getYPixel() {
        return (int)Math.round(this.getYDp() * MapsActivity.DPI_FACTOR);
    }

    public int getXDp() {
        return CoordUntil.getXDp(this.col);
    }

    public int getXPixel() {
        return (int)Math.round(this.getXDp() * MapsActivity.DPI_FACTOR);
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
    }
}
