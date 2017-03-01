import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

public class Optimizer {


    private final static int REDUCE_ROW_FACTOR = 3;
    private final static int REDUCE_COL_FACTOR = 3;

    public static void main(String [] args) {
        System.out.println("Working Directory = " +
                System.getProperty("user.dir"));

        Reader in = null;
        Iterable<CSVRecord> records = null;

        boolean skipHeader = true;

        try {

            in = new FileReader("ascii_2013all.csv");
            records = CSVFormat.TDF.parse(in);

            String outputFile = System.getProperty("user.dir") + "/ascii_2013all.optimized-" + REDUCE_ROW_FACTOR + "-" + REDUCE_COL_FACTOR + ".csv";
            FileWriter fileWriter = new FileWriter(outputFile);
            CSVPrinter csvFilePrinter = new CSVPrinter(fileWriter, CSVFormat.EXCEL);


            boolean skipRow = false;
            int currentDataRow = 0;
            double cellVal;
            String headerItem;
            List<Double> myNewCsvRecord;
            List<String> headerRecord;
            for (CSVRecord record : records) {

                if (skipHeader) {
                    System.out.println("Printing header");

                    skipHeader = false;

                    headerRecord = new ArrayList<String>();
                    for(int col=0; col < record.size(); col++) {
                        headerItem = record.get(col);
                        if (REDUCE_COL_FACTOR ==0 || (col % REDUCE_COL_FACTOR) != 0) {
                            // rowHeader['Var ' +  (col + 1)] = cellVal;
                            headerRecord.add(headerItem);
                        }

                    }

                    csvFilePrinter.printRecord(headerRecord);

                }
                else {
                    currentDataRow ++;
                    skipRow = (REDUCE_ROW_FACTOR != 0 && (currentDataRow % REDUCE_ROW_FACTOR == 0)) ? true : false;
                    if (skipRow) {
                        continue;
                    }

                    myNewCsvRecord = new ArrayList<Double>();
                    for(int col=0; col < record.size(); col++) {
                        cellVal = Double.parseDouble(record.get(col));
                        if (REDUCE_COL_FACTOR ==0 || (col % REDUCE_COL_FACTOR) != 0) {
                            // rowHeader['Var ' +  (col + 1)] = cellVal;
                            myNewCsvRecord.add(cellVal);
                        }

                    }

                    csvFilePrinter.printRecord(myNewCsvRecord);
                }
            }

            fileWriter.flush();
            fileWriter.close();
            csvFilePrinter.close();

        } catch (IOException e) {
            e.printStackTrace();
        }


    }
}
