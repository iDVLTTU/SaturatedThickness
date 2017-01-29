package com.example.hoanglong.googlemaptest;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Point;
import android.provider.Settings;
import android.support.v4.util.LongSparseArray;

import java.util.List;

public class PointFinder {

    private static final int ACCEPTABLE_CLOSEST_DISTANCE_THRESHOLD = 1000;// in km

    private LongSparseArray pointList;

    public PointFinder(LongSparseArray pointList) {
        this.pointList = pointList;
    }

    public PointData findClosestPoint(double latitude, double longtitude) {
        double min = ACCEPTABLE_CLOSEST_DISTANCE_THRESHOLD;
        double dis;
        PointData closest = null;

        for(int i = 0; i < pointList.size(); i++) {
            long key = pointList.keyAt(i);
            // get the object by the key.
            PointData p = (PointData)pointList.get(key);
            dis = p.distance(latitude, longtitude);
            if (min > dis) {
                min = dis;
                closest = p;
            }
        }

        return closest;
    }
}
