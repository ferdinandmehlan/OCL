package ocl.monticoreocl.ocl._symboltable;

import java.util.Collection;

import de.monticore.io.paths.ModelPath;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import de.monticore.symboltable.MutableScope;
import de.monticore.symboltable.ResolvingConfiguration;


public class OCLModelLoader extends OCLModelLoaderTOP {

	public OCLModelLoader(OCLLanguage language) {
		super(language);
	}

	@Override
	public Collection<ASTCompilationUnit> loadModelsIntoScope(final String qualifiedModelName, final ModelPath modelPath, final MutableScope enclosingScope, final ResolvingConfiguration resolvingConfiguration) {
		final Collection<ASTCompilationUnit> asts = loadModels(qualifiedModelName, modelPath);

		for (ASTCompilationUnit ast : asts) {
			createSymbolTableFromAST(ast, qualifiedModelName, enclosingScope, resolvingConfiguration);
		}

		return asts;
	}
}
