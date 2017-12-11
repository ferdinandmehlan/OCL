package test;

import java.util.stream.Collectors;

public class CollectorsTest {
    public static void main(String[] args) {
      try{
          System.out.println("Calling Collectors.toList()!");
          System.out.println(Collectors.toList());
          System.exit(0);
      } catch (Error e) {
          e.printStackTrace();
      }
    }
}

