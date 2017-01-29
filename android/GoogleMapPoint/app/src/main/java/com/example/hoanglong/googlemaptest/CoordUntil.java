package com.example.hoanglong.googlemaptest;

public class CoordUntil {

    public static int getYDp(int yCoord) {
        return (int)Math.round(yCoord*1.0f / MapsActivity.SCALE_Y) + MapsActivity.COOR_Y;
    }

    public static int getXDp(int yCoord) {
        return (int)Math.round(yCoord*1.0f / MapsActivity.SCALE_X) + MapsActivity.COOR_X;
    }

    public static int getXCoordinate(int xDp) {
        return (int)Math.round((xDp - MapsActivity.COOR_X)*MapsActivity.SCALE_X);
    }

    public static int getYCoordinate(int yDp) {
        return (int)Math.round((yDp - MapsActivity.COOR_Y)*MapsActivity.SCALE_Y);
    }

}
