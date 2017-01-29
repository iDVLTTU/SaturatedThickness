package com.example.hoanglong.googlemaptest;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Point;
import android.provider.Settings;

import java.util.List;

public class PointFinder {

    private static final int ACCEPTABLE_CLOSEST_DISTANCE_THRESHOLD = 1000;// in km

    private List<PointData> pointList;

    public PointFinder(List<PointData> pointList) {
        this.pointList = pointList;
    }

    public List<PointData> getPointList() {
        return pointList;
    }


    public PointData findClosestPoint(double latitude, double longtitude) {
        double min = ACCEPTABLE_CLOSEST_DISTANCE_THRESHOLD;
        double dis;
        PointData closest = null;
        for (PointData p : pointList) {

//            if (p.getId() == 273623) {
//                closest = p;
//                break;
//            }
            dis = p.distance(latitude, longtitude);
            if (min > dis) {
                min = dis;
                closest = p;
            }
        }

        return closest;
    }
}
