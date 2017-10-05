
package ocl.monticoreocl.ocl._symboltable;


import java.util.Optional;

import de.monticore.ModelingLanguage;
import de.monticore.ast.ASTNode;
import de.monticore.modelloader.ModelingLanguageModelLoader;
import de.monticore.symboltable.MutableScope;
import de.monticore.symboltable.ResolvingConfiguration;
import de.monticore.symboltable.resolving.CommonResolvingFilter;


public class OCLLanguage extends OCLLanguageTOP implements ModelingLanguage {

	public static final String FILE_ENDING = "ocl";

	public OCLLanguage() {
		super("OCL Language", FILE_ENDING);
	}

	@Override
	protected void initResolvingFilters() {
		super.initResolvingFilters();

		addResolver(new CommonResolvingFilter<OCLFileSymbol>(OCLFileSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLInvariantSymbol>(OCLInvariantSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLMethodSignatureSymbol>(OCLMethodSignatureSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLConstructorSignatureSymbol>(OCLConstructorSignatureSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLThrowsClauseSymbol>(OCLThrowsClauseSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLParameterDeclarationSymbol>(OCLParameterDeclarationSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLVariableDeclarationSymbol>(OCLVariableDeclarationSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLMethodDeclarationSymbol>(OCLMethodDeclarationSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLPreStatementSymbol>(OCLPreStatementSymbol.KIND));
		addResolver(new CommonResolvingFilter<OCLPostStatementSymbol>(OCLPostStatementSymbol.KIND));

		setModelNameCalculator(new OCLModelNameCalculator());
	}

	@Override
	protected ModelingLanguageModelLoader<? extends ASTNode> provideModelLoader() {
		return new OCLModelLoader(this);
	}
	
	@Override
	public Optional<OCLSymbolTableCreator> getSymbolTableCreator(ResolvingConfiguration resolvingConfiguration, MutableScope enclosingScope) {
		return Optional.of(new OCLSymbolTableCreator(resolvingConfiguration, enclosingScope));
	}
}