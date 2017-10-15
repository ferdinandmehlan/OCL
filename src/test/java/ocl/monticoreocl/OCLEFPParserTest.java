package ocl.monticoreocl;

import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._parser.OCLParser;
import org.antlr.v4.runtime.RecognitionException;
import org.junit.Ignore;
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;


public class OCLEFPParserTest {

    private void test(Path model) throws RecognitionException, IOException {
        OCLParser parser = new OCLParser();
        Optional<ASTCompilationUnit> cdDef = parser.parse(model.toString());
        assertFalse(parser.hasErrors());
        assertTrue(cdDef.isPresent());
    }

    @Test
    public void ruleInstTrace() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleInstTrace.ocl");
        test(model);
    }

    @Test
    public void ruleInstEncryption() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleInstEncryption.ocl");
        test(model);
    }

    @Test
    public void ruleInstAuthentication() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleInstAuthentication.ocl");
        test(model);
    }

    @Test
    public void ruleInstCertificates() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleInstCertificates.ocl");
        test(model);
    }

    @Ignore
    @Test
    public void ruleCompEncryption() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleCompEncryption.ocl");
        test(model);
    }

    @Test
    public void rulePortEnergy() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/rulePortEnergy.ocl");
        test(model);
    }

    @Test
    public void ruleWCETSingleCore() throws RecognitionException, IOException {
        Path model = Paths.get("src/test/resources/example/validEFPConstraints/ruleWCETSingleCore.ocl");
        test(model);
    }
}
