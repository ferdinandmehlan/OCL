package ocl.monticoreocl.ocl._symboltable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import ocl.monticoreocl.ocl._ast.*;
import de.monticore.symboltable.ArtifactScope;
import de.monticore.symboltable.ImportStatement;
import de.monticore.symboltable.MutableScope;
import de.monticore.symboltable.ResolvingConfiguration;
import de.monticore.types.types._ast.ASTImportStatement;
import de.monticore.types.types._ast.ASTType;
import de.se_rwth.commons.Names;
import de.se_rwth.commons.logging.Log;

public class OCLSymbolTableCreator extends OCLSymbolTableCreatorTOP {
	
	public OCLSymbolTableCreator(final ResolvingConfiguration resolverConfig, final MutableScope enclosingScope) {
		super(resolverConfig, enclosingScope);
	}

	@Override
	public void visit(final ASTCompilationUnit compilationUnit) {
		Log.debug("Building Symboltable for OCL: " + compilationUnit.getOCLFile().getFileName(), OCLSymbolTableCreator.class.getSimpleName());
		String compilationUnitPackage = Names.getQualifiedName(compilationUnit.getPackage());

		// imports
		List<ImportStatement> imports = new ArrayList<>();
		for (ASTImportStatement astImportStatement : compilationUnit.getImportStatements()) {
			String qualifiedImport = Names.getQualifiedName(astImportStatement.getImportList());
			ImportStatement importStatement = new ImportStatement(qualifiedImport, astImportStatement.isStar());
			imports.add(importStatement);
		}

		ArtifactScope artifactScope = new ArtifactScope(Optional.empty(), compilationUnitPackage, imports);
		putOnStack(artifactScope);
	}

	@Override
	public void endVisit(final ASTCompilationUnit compilationUnit) {
		setEnclosingScopeOfNodes(compilationUnit);
		Log.debug("Setting enclosingScope: "+ compilationUnit, OCLSymbolTableCreator.class.getSimpleName());
		Log.debug("endVisit of " + compilationUnit.getOCLFile().getFileName(), OCLSymbolTableCreator.class.getSimpleName());
	}

	@Override
	public void visit(final ASTOCLFile astFile) {
		final String oclName = astFile.getFileName();
		final OCLFileSymbol oclSymbol = new OCLFileSymbol(oclName);

		addToScopeAndLinkWithNode(oclSymbol, astFile);
	}

	@Override
	public void endVisit(final ASTOCLFile astFile) {
		Log.debug("Finished build of symboltable for OCL: " + astFile.getFileName(), OCLSymbolTableCreator.class.getSimpleName());

		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLMethodSignature astMethSig) {
		final OCLMethodSignatureSymbol methSigSymbol = new OCLMethodSignatureSymbol(astMethSig.getMethodName());

		setMethodName(methSigSymbol, astMethSig);
		setClassNameOfMethodSignature(methSigSymbol, astMethSig);
		setReturnTypeOfMethodSignature(methSigSymbol, astMethSig);

		addToScopeAndLinkWithNode(methSigSymbol, astMethSig);
	}

	public void setMethodName(final OCLMethodSignatureSymbol methSigSymbol, final ASTOCLMethodSignature astMethSig){
		if(astMethSig != null){

			methSigSymbol.setMethodSignatureName(astMethSig.getMethodName());
		}

	}

	public void setClassNameOfMethodSignature(final OCLMethodSignatureSymbol methSigSymbol, final ASTOCLMethodSignature astMethSig){

		if( astMethSig != null ){
			String className = astMethSig.getClassName().get();
			if(className != null){
				methSigSymbol.setClassName(className);
			}
		}
	}

	public void setReturnTypeOfMethodSignature(final OCLMethodSignatureSymbol methSigSymbol, final ASTOCLMethodSignature astMethSig){
		if(astMethSig != null){
			ASTType returnType = astMethSig.getType().get();
			if(returnType != null){
				methSigSymbol.setReturnType(returnType);
			}
		}
	}

	@Override
	public void endVisit(final ASTOCLMethodSignature astMethSig) {

		removeCurrentScope();

	}

	@Override
	public void visit(final ASTOCLConstructorSignature astClass) {
		final OCLConstructorSignatureSymbol classSymbol = new OCLConstructorSignatureSymbol(astClass.getReferenceType());
		addToScopeAndLinkWithNode(classSymbol, astClass);
	}

	@Override
	public void endVisit(final ASTOCLConstructorSignature astDefinition) {
		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLThrowsClause astThrowsClause) {
		final OCLThrowsClauseSymbol throwsClauseSymbol = new OCLThrowsClauseSymbol(astThrowsClause.getThrowables().get(0));

		addToScopeAndLinkWithNode(throwsClauseSymbol, astThrowsClause);
	}

	@Override
	public void visit(final ASTOCLVariableDeclaration astVariableDeclaration) {
		final OCLVariableDeclarationSymbol varDeclSymbol = new OCLVariableDeclarationSymbol(astVariableDeclaration.getVarName().get());

		setNameOfVariableDeclaration(varDeclSymbol, astVariableDeclaration);
		setClassNameOfVarDecl(varDeclSymbol, astVariableDeclaration);

		addToScopeAndLinkWithNode(varDeclSymbol, astVariableDeclaration);
	}
	
	public void setNameOfVariableDeclaration(final OCLVariableDeclarationSymbol varDeclSymbol, final ASTOCLVariableDeclaration astVariableDeclaration){
		if(astVariableDeclaration != null){
			varDeclSymbol.setName(astVariableDeclaration.getVarName().get());
		}

	}

	public void setClassNameOfVarDecl(final OCLVariableDeclarationSymbol varDeclSymbol, final ASTOCLVariableDeclaration astVariableDeclaration){
		if(astVariableDeclaration != null){
			if(astVariableDeclaration.oCLNestedContainerIsPresent()){
				ASTOCLNestedContainer astCont = astVariableDeclaration.getOCLNestedContainer().get();
				if(astCont.getOCLContainerOrName().nameIsPresent())
					varDeclSymbol.setClassName(astCont.getOCLContainerOrName().getName().get());
			}
			if(astVariableDeclaration.classNameIsPresent()){
				varDeclSymbol.setClassName(astVariableDeclaration.getClassName().get());
			}
			if(astVariableDeclaration.typeIsPresent()){
				ASTType returnType = astVariableDeclaration.getType().get();
				if(returnType != null){
					varDeclSymbol.setType(returnType);
				}
			}
		}


	}

	@Override
	public void endVisit(final ASTOCLVariableDeclaration astVariableDeclaration) {
		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLParameterDeclaration astParamDecl) {
		final OCLParameterDeclarationSymbol paramDeclSymbol = new OCLParameterDeclarationSymbol(astParamDecl.getVarName().get());

		setTypeOfParameter(paramDeclSymbol, astParamDecl);

		setNameOfParameter(paramDeclSymbol, astParamDecl);


		addToScopeAndLinkWithNode(paramDeclSymbol, astParamDecl);
	}

	public void setTypeOfParameter(final OCLParameterDeclarationSymbol paramDeclSymbol, final ASTOCLParameterDeclaration astParamDecl){
		if(astParamDecl != null){
			if(astParamDecl.typeIsPresent()) {
				paramDeclSymbol.setType(astParamDecl.getType().get());
			}
		}
	}


	public void setNameOfParameter(final OCLParameterDeclarationSymbol paramDeclSymbol, final ASTOCLParameterDeclaration astParamDecl){
		if(astParamDecl != null){
			paramDeclSymbol.setName(astParamDecl.getVarName().get());
		}  
	}

	@Override
	public void visit(final ASTOCLInvariant astInvariant){
		String invName = "invariantName";
		if(astInvariant.nameIsPresent()) {
			invName = astInvariant.getName().get();
		}
		final OCLInvariantSymbol invSymbol = new OCLInvariantSymbol(invName);
		final ASTOCLClassContext astClassContext = astInvariant.getOCLClassContext().orElse(new ASTOCLClassContext.Builder().build());

		setClassName(invSymbol, astInvariant);
		setClassObject(invSymbol, astInvariant);
		setClassContextIsPresent(invSymbol, astClassContext);	

		addToScopeAndLinkWithNode(invSymbol, astInvariant);

	}

	@Override
	public void visit(final ASTOCLContextDefinition astContext){
		final OCLVariableDeclarationSymbol varDeclSymbol = new OCLVariableDeclarationSymbol(astContext.getName().get());

		varDeclSymbol.setName(astContext.getName().get());
		varDeclSymbol.setClassName(astContext.getClassName().toString());

		addToScope(varDeclSymbol);

	}

	public void setClassContextIsPresent(final OCLInvariantSymbol invSymbol, ASTOCLClassContext astClassContext){
		if(astClassContext != null ){
			if(astClassContext.isContext()){
				invSymbol.setContext(astClassContext.isContext());
			}
			else if(astClassContext.isImport()){
				invSymbol.setImport(astClassContext.isImport());
			}
		}
	}

	public void setClassName(final OCLInvariantSymbol invSymbol, final ASTOCLInvariant astInvariant){
		if(astInvariant.oCLClassContextIsPresent()){
			invSymbol.setClassN(astInvariant.getOCLClassContext().get().getContextDefinitions().get(0).getClassName().toString());
		}

	}

	public void setClassObject(final OCLInvariantSymbol invSymbol, final ASTOCLInvariant astInvariant){
		if(astInvariant.oCLClassContextIsPresent()){
			invSymbol.setClassO(astInvariant.getOCLClassContext().get().getContextDefinitions().get(0).getName().get());
		}
	}

	@Override
	public void endVisit(final ASTOCLInvariant astInvariant) {

		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLMethodDeclaration astMethodDeclaration){
		final OCLMethodDeclarationSymbol methDeclSymbol = new OCLMethodDeclarationSymbol(astMethodDeclaration.getName().get());

		setReturnTypeOfMethodDecl(methDeclSymbol, astMethodDeclaration);
		addToScopeAndLinkWithNode(methDeclSymbol, astMethodDeclaration);
	}

	public void setReturnTypeOfMethodDecl(final OCLMethodDeclarationSymbol methDeclSymbol, final ASTOCLMethodDeclaration astMethodDeclaration){
		if(astMethodDeclaration != null){
			methDeclSymbol.setReturnType(astMethodDeclaration.getReturnType().get());
		}

	}
	
	@Override
	public void endVisit(final ASTOCLMethodDeclaration astInvariant) {

		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLPreStatement astPreStatement){
		final OCLPreStatementSymbol preSymbol = new OCLPreStatementSymbol(astPreStatement.getName().get());
		addToScopeAndLinkWithNode(preSymbol, astPreStatement);

	}

	@Override
	public void visit(final ASTOCLPostStatement astPostStatement){
		final OCLPostStatementSymbol postSymbol = new OCLPostStatementSymbol(astPostStatement.getName().get());
		addToScopeAndLinkWithNode(postSymbol, astPostStatement);

	}
}