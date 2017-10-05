
package ocl.monticoreocl;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.Optional;

import org.antlr.v4.runtime.RecognitionException;

import de.monticore.ModelingLanguageFamily;
import de.monticore.cocos.helper.Assert;
import de.monticore.io.paths.ModelPath;
import de.monticore.symboltable.GlobalScope;
import de.monticore.symboltable.ResolvingConfiguration;
import de.monticore.symboltable.Scope;
import de.se_rwth.commons.logging.Finding;
import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._parser.OCLParser;
import ocl.monticoreocl.ocl._symboltable.OCLLanguage;
import ocl.monticoreocl.ocl._symboltable.OCLSymbolTableCreator;

public abstract class AbstractOCLTest {

	private final OCLLanguage ocllang = new OCLLanguage();
	OCLParser parser = new OCLParser();

	private GlobalScope globalScope;

	protected Scope cdScope;

	public AbstractOCLTest() {
	}

	abstract protected OCLCoCoChecker getChecker();

	protected void testModelForErrors(String model, Collection<Finding> expectedErrors) {
		OCLCoCoChecker checker = getChecker();

		ASTCompilationUnit root = loadModel(model);
		checker.checkAll(root);
		Assert.assertEqualErrorCounts(expectedErrors, Log.getFindings());
		Assert.assertErrorMsg(expectedErrors, Log.getFindings());
	}

	protected void testModelNoErrors(String model) {
		OCLCoCoChecker checker = getChecker();
		ASTCompilationUnit root = loadModel(model);
		checker.checkAll(root);
		assertEquals(0, Log.getFindings().stream().filter(f -> f.isError()).count());
	}

	protected ASTCompilationUnit loadModel(String modelFullQualifiedFilename) {
		Path model = Paths.get(modelFullQualifiedFilename);

		try {
			Optional<ASTCompilationUnit> root = parser.parse(model.toString());
			if (root.isPresent()) {
				// create Symboltable
				ModelingLanguageFamily fam = new ModelingLanguageFamily();
				fam.addModelingLanguage(new OCLLanguage());
				final ModelPath mp = new ModelPath(model.toAbsolutePath());
				this.globalScope = new GlobalScope(mp, fam);

				ResolvingConfiguration resolvingConfiguration = new ResolvingConfiguration();
				resolvingConfiguration.addTopScopeResolvers(ocllang.getResolvers());
				Optional<OCLSymbolTableCreator> stc = ocllang.getSymbolTableCreator(resolvingConfiguration, globalScope);
				if (stc.isPresent()) {
					stc.get().createFromAST(root.get());
				}
				cdScope = globalScope.getSubScopes().get(0).getSubScopes().get(0);
				return root.get();
			}
		} catch (RecognitionException | IOException e) {
			e.printStackTrace();
		}
		throw new RuntimeException("Error during loading of model " + modelFullQualifiedFilename + ".");
	}

}
