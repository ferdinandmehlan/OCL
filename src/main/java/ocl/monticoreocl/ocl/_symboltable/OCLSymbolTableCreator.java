/**
 * ******************************************************************************
 *  MontiCAR Modeling Family, www.se-rwth.de
 *  Copyright (c) 2017, Software Engineering Group at RWTH Aachen,
 *  All rights reserved.
 *
 *  This project is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 3.0 of the License, or (at your option) any later version.
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this project. If not, see <http://www.gnu.org/licenses/>.
 * *******************************************************************************
 */
package ocl.monticoreocl.ocl._symboltable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import de.monticore.ast.ASTNode;
import de.monticore.symboltable.*;
import de.monticore.symboltable.types.references.ActualTypeArgument;
import de.monticore.types.TypesPrinter;
import de.monticore.types.types._ast.*;
import de.monticore.umlcd4a.symboltable.references.CDTypeSymbolReference;
import de.se_rwth.commons.Joiners;
import ocl.monticoreocl.ocl._ast.*;
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

		// Todo integrate CD scopes
		/*
		ModelPath modelPath = new ModelPath(Paths.get("src/test/resources"));
		CD4AnalysisLanguage cd4AnalysisLanguage = new CD4AnalysisLanguage();
		ModelingLanguageFamily modelingLanguageFamily = new ModelingLanguageFamily();
		modelingLanguageFamily.addModelingLanguage(cd4AnalysisLanguage);
		CD4AnalysisSymbolTableCreator cd4AnalysisSymbolTableCreator =
				cd4AnalysisLanguage.getSymbolTableCreator(new ResolvingConfiguration(), artifactScope).get();
		Optional<ASTCDCompilationUnit> astCDCompilationUnit =
				cd4AnalysisLanguage.getModelLoader().loadModel("de.monticore.montiarc.symboltable.MontiArc", modelPath);
		astCDCompilationUnit.get().accept(cd4AnalysisSymbolTableCreator);
		*/
	}

	@Override
	public void endVisit(final ASTCompilationUnit compilationUnit) {
		setEnclosingScopeOfNodes(compilationUnit);
		Log.debug("Setting enclosingScope: " + compilationUnit, OCLSymbolTableCreator.class.getSimpleName());
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

		methSigSymbol.setMethodSignatureName(astMethSig.getMethodName());
		setClassNameOfMethodSignature(methSigSymbol, astMethSig);
		setReturnTypeOfMethodSignature(methSigSymbol, astMethSig);

		addToScopeAndLinkWithNode(methSigSymbol, astMethSig);
	}

	protected void setClassNameOfMethodSignature(final OCLMethodSignatureSymbol methSigSymbol, final ASTOCLMethodSignature astMethSig) {
		String className = astMethSig.getClassName().get();
		if (className != null) {
			methSigSymbol.setClassName(className);
		}
	}

	protected void setReturnTypeOfMethodSignature(final OCLMethodSignatureSymbol methSigSymbol, final ASTOCLMethodSignature astMethSig) {
		ASTType returnType = astMethSig.getType().get();
		if (returnType != null) {
			methSigSymbol.setReturnType(returnType);
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
	public void visit(final ASTOCLParameterDeclaration astParamDecl) {
		final OCLParameterDeclarationSymbol paramDeclSymbol = new OCLParameterDeclarationSymbol(astParamDecl.getVarName().get());

		setTypeOfParameter(paramDeclSymbol, astParamDecl);
		setNameOfParameter(paramDeclSymbol, astParamDecl);

		addToScopeAndLinkWithNode(paramDeclSymbol, astParamDecl);
	}

	protected void setTypeOfParameter(final OCLParameterDeclarationSymbol paramDeclSymbol, final ASTOCLParameterDeclaration astParamDecl) {
		if (astParamDecl != null) {
			if (astParamDecl.typeIsPresent()) {
				paramDeclSymbol.setType(astParamDecl.getType().get());
			}
		}
	}

	protected void setNameOfParameter(final OCLParameterDeclarationSymbol paramDeclSymbol, final ASTOCLParameterDeclaration astParamDecl) {
		if (astParamDecl != null) {
			paramDeclSymbol.setName(astParamDecl.getVarName().get());
		}
	}

	@Override
	public void visit(final ASTOCLInvariant astInvariant) {
		String invName = "invariantName";
		if (astInvariant.nameIsPresent()) {
			invName = astInvariant.getName().get();
		}
		final OCLInvariantSymbol invSymbol = new OCLInvariantSymbol(invName);
		final ASTOCLClassContext astClassContext = astInvariant.getOCLClassContext().orElse(new ASTOCLClassContext.Builder().build());

		setClassName(invSymbol, astInvariant);
		setClassObject(invSymbol, astInvariant);
		setClassContextIsPresent(invSymbol, astClassContext);

		addToScopeAndLinkWithNode(invSymbol, astInvariant);
	}

	protected void setClassContextIsPresent(final OCLInvariantSymbol invSymbol, ASTOCLClassContext astClassContext) {
		if (astClassContext.isContext()) {
			invSymbol.setContext(astClassContext.isContext());
		} else if (astClassContext.isImport()) {
			invSymbol.setImport(astClassContext.isImport());
		}
	}

	protected void setClassName(final OCLInvariantSymbol invSymbol, final ASTOCLInvariant astInvariant) {
		if (astInvariant.oCLClassContextIsPresent()) {
			invSymbol.setClassN(astInvariant.getOCLClassContext().get().getContextDefinitions().get(0).getClassName().toString());
		}
	}

	protected void setClassObject(final OCLInvariantSymbol invSymbol, final ASTOCLInvariant astInvariant) {
		if (astInvariant.oCLClassContextIsPresent()) {
			invSymbol.setClassO(astInvariant.getOCLClassContext().get().getContextDefinitions().get(0).getName().get());
		}
	}

	@Override
	public void endVisit(final ASTOCLInvariant astInvariant) {
		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLMethodDeclaration astMethodDeclaration) {
		final OCLMethodDeclarationSymbol methDeclSymbol = new OCLMethodDeclarationSymbol(astMethodDeclaration.getName().get());
		setReturnTypeOfMethodDecl(methDeclSymbol, astMethodDeclaration);
		addToScopeAndLinkWithNode(methDeclSymbol, astMethodDeclaration);
	}

	public void setReturnTypeOfMethodDecl(final OCLMethodDeclarationSymbol methDeclSymbol, final ASTOCLMethodDeclaration astMethodDeclaration) {
		if (astMethodDeclaration != null) {
			methDeclSymbol.setReturnType(astMethodDeclaration.getReturnType().get());
		}
	}

	@Override
	public void endVisit(final ASTOCLMethodDeclaration astInvariant) {
		removeCurrentScope();
	}

	@Override
	public void visit(final ASTOCLPreStatement astPreStatement) {
		final OCLPreStatementSymbol preSymbol = new OCLPreStatementSymbol(astPreStatement.getName().get());
		addToScopeAndLinkWithNode(preSymbol, astPreStatement);
	}

	@Override
	public void visit(final ASTOCLPostStatement astPostStatement) {
		final OCLPostStatementSymbol postSymbol = new OCLPostStatementSymbol(astPostStatement.getName().get());
		addToScopeAndLinkWithNode(postSymbol, astPostStatement);
	}



	/*
	 *  ********** VariableDeclarationSymbols **********
	 */

	@Override
	public void visit(final ASTOCLContextDefinition astContext) {
		String name = astContext.getName().get();
		String typeName = astContext.getClassName().toString();
		addVarDeclSymbol(name, typeName, astContext);
	}

	@Override
	public void visit(final ASTOCLExistsExpr astoclExistsExpr) {
		if (astoclExistsExpr.oCLCollectionVarDeclarationIsPresent()) {
			ASTOCLInExpr inExpr = astoclExistsExpr.getOCLCollectionVarDeclaration().get().getOCLInExpr().get();
			handleInExpr(astoclExistsExpr, inExpr);
		}
	}


	@Override
	public void visit(final ASTOCLForallExpr astForAllExpr) {
		if (astForAllExpr.oCLCollectionVarDeclarationIsPresent()) {
			ASTOCLInExpr inExpr = astForAllExpr.getOCLCollectionVarDeclaration().get().getOCLInExpr().get();
			handleInExpr(astForAllExpr, inExpr);
		}
	}

	protected void handleInExpr(ASTOCLNode astNode, ASTOCLInExpr inExpr) {
		if (inExpr.oCLInWithTypeIsPresent()) {
			ASTOCLInWithType inWithType = inExpr.getOCLInWithType().get();
			String name = inWithType.getVarName();
			String typeName = TypesPrinter.printType(inWithType.getType().get());
			addVarDeclSymbol(name, typeName, astNode);
		} else if (inExpr.oCLInWithOutTypeIsPresent()) {
			// Todo get type from expression
		}
	}

	@Override
	public void visit(final ASTOCLVariableDeclaration astVariableDeclaration) {
		String name = astVariableDeclaration.getVarName().get();
		CDTypeSymbolReference typeReference = getTypeSymbolReferenceFromASTVarDecl(astVariableDeclaration);
		final OCLVariableDeclarationSymbol varDeclSymbol = new OCLVariableDeclarationSymbol(name, typeReference);
		// Todo: cross-check with expression?
		addToScopeAndLinkWithNode(varDeclSymbol, astVariableDeclaration);
	}

	protected CDTypeSymbolReference getTypeSymbolReferenceFromASTVarDecl(ASTOCLVariableDeclaration astVariableDeclaration) {
		CDTypeSymbolReference typeReference;

		if (astVariableDeclaration.oCLNestedContainerIsPresent()) { // List<..> myVar = ..
			typeReference = getTypeSymbolReferenceFromNestedContainer(astVariableDeclaration.getOCLNestedContainer().get());
		} else if (astVariableDeclaration.classNameIsPresent()) { // MyClass myVar = ..
			String typeName = astVariableDeclaration.getClassName().get();
			typeReference = new CDTypeSymbolReference(typeName, this.getFirstCreatedScope());
			if (!typeReference.existsReferencedSymbol()) {
				Log.error("The variable type does not exist: " + typeName, astVariableDeclaration.get_SourcePositionStart());
			}
		} else if (astVariableDeclaration.typeIsPresent()) { // int myVar = ..
			String typeName = astVariableDeclaration.getType().get().toString();
			typeReference = new CDTypeSymbolReference(typeName, this.getFirstCreatedScope());
			ASTType astType = astVariableDeclaration.getType().get();
			typeReference.setStringRepresentation(TypesPrinter.printType(astType));
			typeReference.setAstNode(astType);
		} else { // myVar = ..
			//Todo: write type inferring
			typeReference = new CDTypeSymbolReference("DefaultClass", this.getFirstCreatedScope());
		}

		return typeReference;
	}

	protected CDTypeSymbolReference getTypeSymbolReferenceFromNestedContainer(ASTOCLNestedContainer astoclNestedContainer) {
		ASTOCLContainerOrName containerOrName = astoclNestedContainer.getOCLContainerOrName();
		String typeName;
		CDTypeSymbolReference typeReference;

		if (containerOrName.nameIsPresent()) {
			typeName = containerOrName.getName().get();
			typeReference = new CDTypeSymbolReference(typeName, this.getFirstCreatedScope());
			typeReference.setStringRepresentation(typeName);
		} else {
			int container = containerOrName.getContainer();
			if (container == 20) {
				typeName = "Set";
			} else if (container == 12) {
				typeName = "List";
			} else {    //if(container == 1) {
				typeName = "Collection";
			}
			typeReference = new CDTypeSymbolReference(typeName, this.getFirstCreatedScope());
			typeReference.setStringRepresentation(typeName);
			addActualArguments(astoclNestedContainer, typeReference);
		}

		return typeReference;
	}

	private void addActualArguments(ASTOCLNestedContainer astoclNestedContainer, CDTypeSymbolReference typeReference) {
		if (astoclNestedContainer.getArguments().size() > 0) {
			List<ActualTypeArgument> actualTypeArguments = new ArrayList<>();
			CDTypeSymbolReference argumentReferenceType = getTypeSymbolReferenceFromNestedContainer(astoclNestedContainer.getArguments().get(0));
			typeReference.setStringRepresentation(typeReference.getStringRepresentation() + "<" + argumentReferenceType.getStringRepresentation() + ">");
			ActualTypeArgument actualTypeArgument = new ActualTypeArgument(argumentReferenceType);
			actualTypeArguments.add(actualTypeArgument);
			typeReference.setActualTypeArguments(actualTypeArguments);
		}
	}

	private OCLVariableDeclarationSymbol addVarDeclSymbol(String name, String typeName, ASTNode astNode) {
		CDTypeSymbolReference typeReference = new CDTypeSymbolReference(typeName, this.getFirstCreatedScope());
		if (!typeReference.existsReferencedSymbol()) {
			Log.error("The variable type does not exist: " + typeName, astNode.get_SourcePositionStart());
		}
		final OCLVariableDeclarationSymbol varDeclSymbol = new OCLVariableDeclarationSymbol(name, typeReference);
		// Todo cross check with expression?
		addToScopeAndLinkWithNode(varDeclSymbol, astNode);
		return  varDeclSymbol;
	}
}