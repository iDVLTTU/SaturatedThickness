package com.example.hoanglong.googlemaptest;

import android.content.Context;
import android.support.v4.util.LongSparseArray;

//import org.opencv.core.Mat;
//import org.opencv.core.Point;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
//import java.util.ArrayList;
//import java.util.List;

public class CSVReader {

    // these are rows and cols data from csv file
    public static int MAX_DATA_ROWS = 1138-19; // last 19 rows do not have data
    public static int MAX_DATA_COLS = 598;
    public static int DATA_WIDTH = 598;


    public static PointPixelData[][] readFileToMatrix(Context context, int resourceId, boolean ignoreFirstRow, LongSparseArray rasterData) {

        PointPixelData [][]map = new PointPixelData[MAX_DATA_ROWS][MAX_DATA_COLS];
        InputStream fis = null;
        try {
            fis = context.getResources().openRawResource(resourceId);
            BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
            String line;
            int row = 0;
            boolean didIgnore = false;
            long id = 0;
            PointPixelData tmp;
            double waterVal;

            while ((line = reader.readLine()) != null) {
                if (ignoreFirstRow && !didIgnore) {
                    didIgnore = true;
                    continue;
                }

                if (row >= MAX_DATA_ROWS) {
                    break;
                }

                String[] rowData = line.split("\t");
                for (int col = 0; col < rowData.length; col++) {
                    if (col >= MAX_DATA_COLS) {
                        continue;
                    }

                    waterVal = Double.parseDouble(rowData[col]);
                    if (waterVal < -9998) {
                        tmp = new PointPixelData(0, waterVal);
                    }
                    else {
                        id ++;

                        tmp = new PointPixelData(id, waterVal, (PointData) rasterData.get(id));
                    }

                    tmp.setRow(row);
                    tmp.setCol(col);

                    map[row][col] = tmp;
                }

                row++;
            }
        }
        catch (IOException ex) {
            // handle exception
            ex.printStackTrace();
        }
        finally {
            try {
                if (fis != null) {
                    fis.close();
                }
            }
            catch (IOException e) {
                // handle exception
                e.printStackTrace();
            }
        }

        return map;
    }

    public static LongSparseArray readPointData(Context context, int resourceId, boolean ignoreFirstRow, String delimiter) {
        LongSparseArray pointList = new LongSparseArray<>();
        InputStream fis = null;
        try {
            fis = context.getResources().openRawResource(resourceId);
            BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
            String line;
            boolean didIgnore = false;
            long pointId;
            while ((line = reader.readLine()) != null) {
                if (ignoreFirstRow && !didIgnore) {
                    didIgnore = true;
                    continue;
                }

                String[] rowData = line.split(delimiter);
                if (rowData.length < 4) {
                    continue;
                }

                pointId = Long.parseLong(rowData[0]);
                if (pointList.get(pointId) != null) {
                    throw new Exception("The data point exists.");
                }

                pointList.put(pointId, new PointData(pointId, Double.parseDouble(rowData[1]), Double.parseDouble(rowData[2]), Double.parseDouble(rowData[3])));
            }
        }
        catch (IOException ex) {
            // handle exception
            ex.printStackTrace();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        finally {
            try {
                if (fis != null) {
                    fis.close();
                }
            }
            catch (IOException e) {
                // handle exception
                e.printStackTrace();
            }
        }

        return pointList;
    }

//    public static List<Point> readFile(Context context, int resourceId, boolean ignoreFirstRow) {
//
//        InputStream fis = null;
//        Point a;
//        List<Point> data2D = new ArrayList<>();
//        try {
//            fis = context.getResources().openRawResource(resourceId);
//            BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
//            String line;
//            int row = 0;
//            boolean didIgnore = false;
//            while ((line = reader.readLine()) != null) {
//                if (ignoreFirstRow && !didIgnore) {
//                    didIgnore = true;
//                    continue;
//                }
//
//                String[] rowData = line.split("\t");
//                for (String value : rowData) {
//                    data2D.add(new Point(row, Integer.parseInt(value)));
//                }
//
//                row++;
//            }
//        }
//        catch (IOException ex) {
//            // handle exception
//            ex.printStackTrace();
//        }
//        finally {
//            try {
//                if (fis != null) {
//                    fis.close();
//                }
//            }
//            catch (IOException e) {
//                // handle exception
//                e.printStackTrace();
//            }
//        }
//
//        return data2D;
//    }

//    public static Mat readFileToMat(Context context, int resourceId, boolean ignoreFirstRow) {
//
//        Mat mat = new Mat();
//
//        InputStream fis = null;
//        try {
//            fis = context.getResources().openRawResource(resourceId);
//            BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
//            String line;
//            int row = 0;
//            boolean didIgnore = false;
//            while ((line = reader.readLine()) != null) {
//                if (ignoreFirstRow && !didIgnore) {
//                    didIgnore = true;
//                    continue;
//                }
//
//                String[] rowData = line.split("\t");
//                int col = 0;
//                for (String value : rowData) {
//                    mat.put(row, col, Double.parseDouble(value));
//                    col ++;
//                }
//
//                row++;
//            }
//        }
//        catch (IOException ex) {
//            // handle exception
//            ex.printStackTrace();
//        }
//        finally {
//            try {
//                if (fis != null) {
//                    fis.close();
//                }
//            }
//            catch (IOException e) {
//                // handle exception
//                e.printStackTrace();
//            }
//        }
//
//        return mat;
//    }
}
