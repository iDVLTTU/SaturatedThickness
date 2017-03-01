import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WellToPoint {


    public static void main(String[] args) {

        Reader in = null;
        Iterable<CSVRecord> records = null;

        boolean skipHeader = true;

        List<PointPixel> finePoints = new ArrayList<PointPixel>();

        try {

            String inputFile = System.getProperty("user.dir") + "/raster_to_point.optimized.csv";
            in = new FileReader(inputFile);

            records = CSVFormat.EXCEL.parse(in);

            for (CSVRecord record : records) {
                if (skipHeader) {
                    skipHeader = false;
                    continue;
                }


                finePoints.add(new PointPixel(
                                Integer.parseInt(record.get(0)),
                                Double.parseDouble(record.get(3)),
                                Double.parseDouble(record.get(2)),
                                Double.parseDouble(record.get(1))

                        )
                );

            }


            setWellsToPoint(finePoints);



        }
        catch (IOException e) {
            e.printStackTrace();
        }
    }


    private static void setWellsToPoint(List<PointPixel> existingPoints) {
        Reader in = null;
        Iterable<CSVRecord> records = null;

        boolean skipHeader = true;
        List<String> myNewCsvRecord;
        List<String> headerRecord;

        try {

            PointPixel closestPoint;
            int wellId;

            in = new FileReader("Dr.Dang_data.csv");
            records = CSVFormat.EXCEL.parse(in);

            String outputFile = System.getProperty("user.dir") + "/well_data_full.optimized.csv";
            FileWriter fileWriter = new FileWriter(outputFile);
            CSVPrinter csvFilePrinter = new CSVPrinter(fileWriter, CSVFormat.EXCEL);


            Map<Integer, PointPixel> wellPositions = new HashMap<Integer, PointPixel>();
            double saturatedThickness = -1;

            for(CSVRecord record : records) {

                if (skipHeader) {

                    headerRecord = new ArrayList<String>();
                    for(int i = 0; i < record.size(); i++) {
                        headerRecord.add(record.get(i));
                        if (i < 1) {
                            headerRecord.add("Point_ID");
                        }
                    }

                    headerRecord.add("SaturatedThickness");
                    csvFilePrinter.printRecord(headerRecord); // print header
                    skipHeader = false;
                    continue;
                }

                //

                wellId = Integer.parseInt(record.get(0));

                if (wellPositions.containsKey(wellId)) {
                    closestPoint = wellPositions.get(wellId);
                }
                else {

                    closestPoint = findClosestPoint(existingPoints, Double.parseDouble(record.get(2)), Double.parseDouble(record.get(1)));
                    wellPositions.put(wellId, closestPoint);
                }

                myNewCsvRecord = new ArrayList<String>();
                for(int i = 0; i < record.size(); i++) {
                    myNewCsvRecord.add(record.get(i));

                    if (i < 1) {
                        myNewCsvRecord.add(Integer.toString(closestPoint.id));
                    }
                }

                if (record.get(8).length() < 1 || record.get(9).length() < 1) {
                    continue;
                }
                saturatedThickness = Double.parseDouble(record.get(8)) - Double.parseDouble(record.get(9));
//                try {
//
//                    saturatedThickness = Double.parseDouble(record.get(8)) - Double.parseDouble(record.get(9));
//                }
//                catch (Exception ec) {
//                    ec.printStackTrace();
//                }
                myNewCsvRecord.add(Double.toString(saturatedThickness));

                csvFilePrinter.printRecord(myNewCsvRecord);
            }

            fileWriter.flush();
            fileWriter.close();
            csvFilePrinter.close();

        }
        catch (IOException e) {
            e.printStackTrace();
        }


    }

    private static double distanceToPoint(PointPixel point, double lat, double lon) {

        double dis = (lon - point.lon) * (lon - point.lon) + (lat - point.lat) * (lat - point.lat);

        return dis;
    }

    private static PointPixel findClosestPoint(List<PointPixel> existingPoints, double lat, double lon) {

        double min = distanceToPoint(existingPoints.get(0), lat, lon);
        PointPixel closestPoint = existingPoints.get(0);
        double tmpDistance;

        for(PointPixel tmpPoint : existingPoints) {
            tmpDistance = distanceToPoint(tmpPoint, lat, lon);

            if (tmpDistance < min) {
                min = tmpDistance;
                closestPoint = tmpPoint;
            }

        }

        return closestPoint;

    }
}



class PointPixel {
    public int id;
    public double lon;
    public double lat;
    public double grid_code;

    public PointPixel(int id, double lat, double lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
    }

    public PointPixel(int id, double lat, double lon, double grid_code) {

        this(id, lat, lon);
        this.grid_code = grid_code;

    }


}
