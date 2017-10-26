package ocl.monticoreocl;


import de.monticore.umlcd4a.cd4analysis._ast.ASTCDCompilationUnit;
import de.monticore.umlcd4a.cd4analysis._parser.CD4AnalysisParser;
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.Assert.assertTrue;

public class OCLSemanticCoCosTest {

    @Test
    public void testCDModelCnC() throws IOException{
        CD4AnalysisParser parser = new CD4AnalysisParser();
        Path model = Paths.get("src/test/resources/de/monticore/montiarc/symboltable/MontiArc.cd");
        Optional<ASTCDCompilationUnit> root = parser.parseCDCompilationUnit(model.toString());
        assertTrue(root.isPresent());

    }
}
