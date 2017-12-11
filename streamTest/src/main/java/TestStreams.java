package streamTest;

import java.util.List;
import java.util.ArrayList;


public class TestStreams {

    public static void main(String[] args) { 
      try {
        List<String> myList = new ArrayList<String>();
        myList.add("one");
        myList.add("two");
        myList.add("three");
        myList.stream().forEach(System.out::println);
          System.out.println(myList.stream().filter(s -> s.equals("one")).count());


      } catch (Error e) {
        e.printStackTrace();
      }
    }
}