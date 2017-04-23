import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
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

public class Optimizer {


    private final static int REDUCE_ROW_FACTOR = 2;
    private final static int REDUCE_COL_FACTOR = 2;

    public static void main(String [] args) {
        System.out.println("Working Directory = " +
                System.getProperty("user.dir"));

        Reader in = null;
        Iterable<CSVRecord> records = null;
        String filename = "ascii_2010all.optimized-2-2";
        boolean skipHeader = true;
        Map<Integer, Boolean> removedPoints = new HashMap<Integer, Boolean>();
        try {

            in = new FileReader(filename + ".csv");

            // !import - change csv for mat CSV or TSV
            records = CSVFormat.DEFAULT.parse(in);

            String outputFile = System.getProperty("user.dir") + "/" + filename + ".optimized-" + REDUCE_ROW_FACTOR + "-" + REDUCE_COL_FACTOR + ".csv";
            FileWriter fileWriter = new FileWriter(outputFile);
            CSVPrinter csvFilePrinter = new CSVPrinter(fileWriter, CSVFormat.EXCEL);


            int pointId = 0;
            boolean skipRow = false;
            int currentDataRow = 0;
            double cellVal;
            String headerItem;
            List<Double> myNewCsvRecord;
            List<String> headerRecord;

            List<PointPixel> finePoints;

            for (CSVRecord record : records) {

                if (skipHeader) {
                    System.out.println("Printing header");

                    headerRecord = new ArrayList<String>();
                    for(int col=0; col < record.size(); col++) {
                        headerItem = record.get(col);
                        if (REDUCE_COL_FACTOR ==0 || (col % REDUCE_COL_FACTOR) != 0) {
                            // rowHeader['Var ' +  (col + 1)] = cellVal;
                            headerRecord.add(headerItem);
                        }

                    }

                    csvFilePrinter.printRecord(headerRecord);
                    skipHeader = false;
                }
                else {
                    currentDataRow ++;
                    skipRow = (REDUCE_ROW_FACTOR != 0 && (currentDataRow % REDUCE_ROW_FACTOR == 0)) ? true : false;
                    if (skipRow) {

                        for(int col=0; col < record.size(); col++) {
                            cellVal = Double.parseDouble(record.get(col));
                            if (cellVal > -9999) {
                                pointId ++;
                                removedPoints.put(pointId, true);
                            }

                        }

                        continue;
                    }

                    myNewCsvRecord = new ArrayList<Double>();
                    for(int col=0; col < record.size(); col++) {
                        cellVal = Double.parseDouble(record.get(col));
                        if (REDUCE_COL_FACTOR ==0 || (col % REDUCE_COL_FACTOR) != 0) {
                            myNewCsvRecord.add(cellVal);

                            if (cellVal > -9999) {
                                pointId ++;
                            }
                        }
                        else {
                            if (cellVal > -9999) {
                                pointId ++;
                                removedPoints.put(pointId, true);
                            }
                        }

                    }

                    csvFilePrinter.printRecord(myNewCsvRecord);
                }
            }

            fileWriter.flush();
            fileWriter.close();
            csvFilePrinter.close();

            optimizeRasterToPoint(removedPoints);

        } catch (IOException e) {
            e.printStackTrace();
        }

    }





    private static void optimizeRasterToPoint(Map<Integer, Boolean> removedPoints) {
        Reader in = null;
        Iterable<CSVRecord> records = null;

        boolean skipHeader = true;

        try {

            in = new FileReader("raster_to_point.csv");
            records = CSVFormat.EXCEL.parse(in);

            String outputFile = System.getProperty("user.dir") + "/raster_to_point.optimized.csv";
            FileWriter fileWriter = new FileWriter(outputFile);
            CSVPrinter csvFilePrinter = new CSVPrinter(fileWriter, CSVFormat.EXCEL);

            int tmpPointId;
            List<String> myNewRecord;
            int newPointId = 0;
            for(CSVRecord record : records) {

                if (skipHeader) {

                    csvFilePrinter.printRecord(record); // print header
                    skipHeader = false;
                    continue;
                }

                tmpPointId = Integer.parseInt(record.get(0));
                if (removedPoints.containsKey(tmpPointId)) {
                    continue;
                }

                newPointId ++;
                myNewRecord = new ArrayList<String>();
                myNewRecord.add(Integer.toString(newPointId));

                for(int i = 1; i <record.size(); i++) {
                    myNewRecord.add(record.get(i));
                }

                csvFilePrinter.printRecord(myNewRecord);
            }

            fileWriter.flush();
            fileWriter.close();
            csvFilePrinter.close();
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}

//class PointPixel {
//    public int id;
//    public double lon;
//    public double lat;
//    public double grid_code;
//
//    public PointPixel(int id, double lat, double lon) {
//        this.id = id;
//        this.lat = lat;
//        this.lon = lon;
//    }
//
//    public PointPixel(int id, double lat, double lon, double grid_code) {
//
//        this(id, lat, lon);
//        this.grid_code = grid_code;
//
//    }
//
//
//}
