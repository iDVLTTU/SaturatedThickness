package com.example.hoanglong.googlemaptest;

import android.Manifest;
import android.animation.IntEvaluator;
import android.animation.ValueAnimator;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

public class MapsActivity extends FragmentActivity {
    private static final String TAG = "MapsActivity";

    private TrackGPS gps;
    double longitude;
    double latitude;

    private PointPixelData[][] data2d;
    private PointFinder pointFinder;
    private ImageView myMap;
    private ImageView myPosition;
    private TextView myText;
//    private TextView myGPS;

    ValueAnimator vAnimator;

    private static final String[] LOCATION_PERMS={
            Manifest.permission.ACCESS_FINE_LOCATION
    };

    private static final int LOCATION_REQUEST = 1340;
    public static double DPI_FACTOR = 3;

    public static final double SCALE_X_DPI_FACTOR_320 = 1.818181818; // 55dp per 100 units of x;
    public static final double SCALE_Y_DPI_FACTOR_320 = 2.857142857; // 70dp per 200 units of y;

    public static final double SCALE_X_DPI_FACTOR_420 = 1.282; // 78dp per 100 units of x;
    public static final double SCALE_Y_DPI_FACTOR_420 = 2.0; // 100dp per 200 units of y;

    public static final double SCALE_X_DPI_FACTOR_480 = 2.0; // 50dp per 100 units of x;
    public static final double SCALE_Y_DPI_FACTOR_480 = 3.076923077; // 65dp per 200 units of y;

    public static double SCALE_X = 2; // 50dp per 100 units of x; dpi=3
    public static double SCALE_Y = 3.076923077; // 65dp per 200 units of y; dpi=3

    private static final int POSITION_ICON_WIDTH = 20; //dp;
    private static final int POSITION_ICON_HEIGHT = 32; //dp;

    public static final int COOR_X = 20; //dp
    public static final int COOR_Y = 15; // dp
    private int xDp;
    private int yDp;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        Log.d(TAG, "Device dpi=" +  metrics.densityDpi);
        Log.d(TAG, "Device density=" +  metrics.density);

        MapsActivity.DPI_FACTOR = (metrics.densityDpi*1.0f)/160;
        Log.d(TAG, "DPI factor=" +  MapsActivity.DPI_FACTOR);

        switch (metrics.densityDpi) {
//            case 480:
//                MapsActivity.SCALE_X = SCALE_X_DPI_FACTOR_480;
//                MapsActivity.SCALE_Y = SCALE_Y_DPI_FACTOR_480;
//                break;
//            case 420:
//                MapsActivity.SCALE_X = SCALE_X_DPI_FACTOR_420;
//                MapsActivity.SCALE_Y = SCALE_Y_DPI_FACTOR_420;
//                break;
//            case 320:
//                MapsActivity.SCALE_X = SCALE_X_DPI_FACTOR_320;
//                MapsActivity.SCALE_Y = SCALE_Y_DPI_FACTOR_320;
//                break;
            default:
                MapsActivity.SCALE_X = SCALE_X_DPI_FACTOR_480;
                MapsActivity.SCALE_Y = SCALE_Y_DPI_FACTOR_480;
        }

        myText = (TextView) findViewById(R.id.textInfo);
//        myGPS = (TextView) findViewById(R.id.gpsInfo);
        myMap = (ImageView)findViewById(R.id.map);
        myPosition = (ImageView)findViewById(R.id.position);
        vAnimator = new ValueAnimator();

        this.data2d = CSVReader.readFileToMatrix(this, R.raw.ascii_2013, true);
        pointFinder = new PointFinder(CSVReader.readPointData(this, R.raw.raster_to_point, true, ","));
        if (!canAccessLocation()) {
            requestPermissions(LOCATION_PERMS, LOCATION_REQUEST);
        }
        else {
            gps = new TrackGPS(this);
            this.displayGeoPointOnMap(gps.getLatitude(), gps.getLongitude());
        }

        myMap.setOnTouchListener(new View.OnTouchListener()
        {

            @Override
            public boolean onTouch(View arg0, MotionEvent event)
            {
                int x = (int) event.getX();
                int y = (int) event.getY();


                Log.v(TAG + "-Touch", "X==" + String.valueOf(x) + " Y==" + String.valueOf(y));
                xDp = (int)Math.round(x/DPI_FACTOR);
                yDp = (int)Math.round(y/DPI_FACTOR);
                Log.v(TAG + "-Touch", "XDp==" + String.valueOf(xDp) + " YDp==" + String.valueOf(yDp));
                Log.v(TAG + "-Touch", "XCoord==" + CoordUntil.getXCoordinate(xDp) + " YCoord==" + CoordUntil.getYCoordinate(yDp));

                //myText.setText("X: " + String.valueOf(x) + "  Z: " + getWaterValue() + "  cX:" + getXCoordinate() + " cY: " + getYCoordinate() + "\nY: " + String.valueOf(y));
                myText.setText("X:" + CoordUntil.getXCoordinate(xDp) + "  Y: " + CoordUntil.getYCoordinate(yDp) + "\nZ: " + getWaterValue());
                Log.d(TAG, "My map width: " + myMap.getWidth());
                Log.d(TAG, "My map Height: " + myMap.getHeight());
                Log.d(TAG, "Image width: " + myPosition.getWidth());
                Log.d(TAG, "Image height: " + myPosition.getHeight());
                Log.d(TAG, "Image measured width: " + myPosition.getMeasuredWidth());
                Log.d(TAG, "Image measured height: " + myPosition.getMeasuredHeight());
                showGPS();

                return false;
            }
        });
    }

    private void createBlinking() {
        vAnimator.setRepeatCount(ValueAnimator.INFINITE);
        vAnimator.setRepeatMode(ValueAnimator.RESTART);  /* PULSE */
        vAnimator.setIntValues(0, 1);
        vAnimator.setDuration(1000);
        vAnimator.setEvaluator(new IntEvaluator());
        vAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        vAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator valueAnimator) {
                float animatedFraction = valueAnimator.getAnimatedFraction();
                // Log.e("", "" + animatedFraction);
                myPosition.setAlpha(animatedFraction);
            }
        });
        vAnimator.start();
    }

    private void displayGeoPointOnMap(double latitude, double longitude) {
        longitude = -101.8756988f;
        latitude = 33.5874824f;

        Log.d(TAG, "Found lat=" + latitude + "; lon=" + longitude);


        PointData myPoint = this.pointFinder.findClosestPoint(latitude, longitude);
        if (myPoint == null) {
            Toast.makeText(this, "Your location is not in this map", Toast.LENGTH_SHORT).show();
            myPosition.setVisibility(View.INVISIBLE);
            return;
        }

        Log.d(TAG, "Found pointDATA id: " + myPoint.getId());

        PointPixelData pointPixel = this.findPointPixel(myPoint);
//        if (pointPixel == null) {
//            return;
//        }

        Log.d(TAG, "Found closest point: id=" + pointPixel.getId() + ";water: " + pointPixel.getWaterValue());
        Log.d(TAG, "Closest: row=" + pointPixel.getRow() + "; col=" + pointPixel.getCol());
        Log.d(TAG, "Closest: xDp=" + pointPixel.getXDp() + "; yDp=" + pointPixel.getYDp());

        myPosition.setX(Math.round(pointPixel.getXPixel() - DPI_FACTOR *(POSITION_ICON_WIDTH/2)));
//        myPosition.setX(0);
        myPosition.setY(Math.round(pointPixel.getYPixel() - DPI_FACTOR *POSITION_ICON_HEIGHT + 40* DPI_FACTOR));
//        myPosition.setY(0);
        Log.d(TAG, "Image width: " + myPosition.getWidth());
        Log.d(TAG, "Image height: " + myPosition.getHeight());
        Log.d(TAG, "Image measured width: " + myPosition.getMeasuredWidth());
        Log.d(TAG, "Image measured height: " + myPosition.getMeasuredHeight());

        myPosition.setVisibility(View.VISIBLE);
        myText.setText("X:" + pointPixel.getRow() + "  Y: " +  pointPixel.getCol() + "\nZ: " + pointPixel.getWaterValue());

        //this.createBlinking();
    }

    private PointPixelData findPointPixel(PointData point) {
        PointPixelData myPoint = null;
        Log.d(TAG, "finding point pixel for point id:" + point.getId());

        for(int i=0; i<data2d.length; i++) {
            for(int j=0; j<data2d[i].length; j++) {
//                if (data2d[i][j].getId() < 2) {
//                    Log.d(TAG, "PointPixID:" + data2d[i][j].getId() + "; waterValue:" + data2d[i][j].getWaterValue());
//                }
                if (data2d[i][j].getWaterValue() < 0) {
                    continue;
                }

                if (data2d[i][j].getId() == point.getId() ) {
                    myPoint = data2d[i][j];
                    break;
                }
            }
        }

        return myPoint;
    }

    private boolean canAccessLocation() {
        return(hasPermission(Manifest.permission.ACCESS_FINE_LOCATION));
    }

    private boolean hasPermission(String perm) {
        return(PackageManager.PERMISSION_GRANTED== ContextCompat.checkSelfPermission(this, perm));
    }

    private void showGPS() {
        if(gps.canGetLocation()){
            longitude = gps.getLongitude();
            latitude = gps.getLatitude();
//            Log.v(TAG + "-Touch", "Longitude==" + longitude + " Y==" + latitude);

//            myGPS.setText("Longitude:"+ Double.toString(longitude)+"\nLatitude:"+ Double.toString(latitude));
        }
        else
        {
            Log.v(TAG + "-Touch", "Cannot get location");

            gps.showSettingsAlert();
        }
    }

    private double getWaterValue() {

        int yCoord = CoordUntil.getYCoordinate(this.yDp);
        int xCoord = CoordUntil.getXCoordinate(this.xDp);

        if (yCoord >= CSVReader.MAX_DATA_ROWS || xCoord >= CSVReader.MAX_DATA_COLS || yCoord< 0 || xCoord< 0) {
            return -9999;
        }



        PointPixelData val = this.data2d[yCoord][xCoord];

        return val.getWaterValue() <= 0 ? -9999 : val.getWaterValue();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {

        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch(requestCode) {

            case LOCATION_REQUEST:
                gps = new TrackGPS(this);
                this.displayGeoPointOnMap(gps.getLatitude(), gps.getLongitude());

                break;
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        gps.stopUsingGPS();
    }
}
