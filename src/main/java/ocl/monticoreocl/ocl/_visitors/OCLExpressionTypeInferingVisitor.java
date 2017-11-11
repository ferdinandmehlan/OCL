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
package ocl.monticoreocl.ocl._visitors;

import de.monticore.ast.ASTNode;
import de.monticore.mcexpressions._ast.ASTExpression;
import de.monticore.symboltable.Scope;
import de.monticore.symboltable.types.references.ActualTypeArgument;
import de.monticore.umlcd4a.cd4analysis._ast.ASTCardinality;
import de.monticore.umlcd4a.symboltable.*;
import de.monticore.umlcd4a.symboltable.references.CDTypeSymbolReference;
import de.monticore.utils.Link;
import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.*;
import ocl.monticoreocl.ocl._symboltable.OCLSymbolTableCreator;
import ocl.monticoreocl.ocl._symboltable.OCLVariableDeclarationSymbol;
import ocl.monticoreocl.ocl._visitor.OCLVisitor;
import siunit.monticoresiunit.si._ast.ASTNumber;
import siunit.monticoresiunit.si._ast.ASTUnitNumber;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;


/**
 * This visitor tries to infer the return type of an ocl expression
 */
public class OCLExpressionTypeInferingVisitor implements OCLVisitor {

    private CDTypeSymbolReference returnTypeRef;
    private OCLVisitor realThis = this;
    private Scope scope;

    public OCLExpressionTypeInferingVisitor(Scope scope) {
        this.returnTypeRef = null;
        this.scope = scope;
    }

    public CDTypeSymbolReference getReturnTypeReference() {
        return returnTypeRef;
    }

    public static CDTypeSymbolReference getTypeFromExpression(ASTOCLExpression node, Scope scope) {
        OCLExpressionTypeInferingVisitor exprVisitor = new OCLExpressionTypeInferingVisitor(scope);
        node.accept(exprVisitor);
        CDTypeSymbolReference typeReference = exprVisitor.getReturnTypeReference();
        if (typeReference==null) {
            Log.error("The variable type could not be resolved from the expression", node.get_SourcePositionStart());
            typeReference = new CDTypeSymbolReference("DefaultClass", exprVisitor.scope);
        }
        return typeReference;
    }



    @Override
    public void traverse(ASTOCLPrefixExpression node) {
        if(node.getOperator() != 0) { // operator:["-" | "+" | "~" | "!"]
            returnTypeRef = createTypeRef("Boolean", node);
        } else if (node.oCLPrimaryIsPresent()) {
            ASTOCLPrimary astPrimary = node.getOCLPrimary().get();
            astPrimary.accept(realThis);
        } else if (node.oCLTypeCastExpressionIsPresent()) {
            // Todo ?
        }
    }

    @Override
    public void traverse(ASTOCLNumberLiteral node) {
        ASTNumber astNumber = node.getValue();
        if(astNumber.unitNumberIsPresent()) {
            ASTUnitNumber astUnitNumber = astNumber.getUnitNumber().get();
            String unitString = astUnitNumber.getUnit().get().toString();
            if (unitString.equals("")) {
                returnTypeRef = createTypeRef("Double", node);
            } else {
                returnTypeRef = createTypeRef("Amount", node); // From the jscience library
                // Todo: some method to get the unit class and add as an argument or Amount:  mW -> Amount<Power>
            }
        } else if(astNumber.complexNumberIsPresent()) {
            // Todo, howto represent complex numbers?
        }
    }

    @Override
    public void traverse(ASTOCLNonNumberLiteral node) {
        String returnType = node.getValue().getClass().getSimpleName().replaceFirst("AST", "").replaceFirst("Literal", "");
        returnTypeRef = createTypeRef(returnType, node);
    }

    @Override
    public void traverse(ASTOCLConcatenation node) {
        LinkedList<String> names = new LinkedList<String>(node.getNames());
        String firstName = node.getNames().get(0);

        // Try and look if name or this was declared as variable
        Optional<OCLVariableDeclarationSymbol> nameDecl = scope.resolve(firstName, OCLVariableDeclarationSymbol.KIND);
        Optional<OCLVariableDeclarationSymbol> thisDecl = scope.resolve("this", OCLVariableDeclarationSymbol.KIND);
        if(nameDecl.isPresent()) {
            names.pop();
            CDTypeSymbolReference typeRef = nameDecl.get().getType();
            returnTypeRef = handleNames(names, typeRef, node);
        } else if (thisDecl.isPresent()) {
            CDTypeSymbolReference typeRef = thisDecl.get().getType();
            returnTypeRef = handleNames(names, typeRef, node);
        } else {
            Log.error("Could not resolve name or type: " + firstName, node.get_SourcePositionStart());
        }
    }

    @Override
    public void traverse(ASTOCLQualifiedPrimary node) {
        CDTypeSymbolReference typeRef = null;
        Optional<OCLVariableDeclarationSymbol> varDecl = Optional.empty();
        LinkedList<String> names = new LinkedList<String>(node.getQualifications());

        if(node.prefixIdentifierIsPresent()) {
            varDecl = scope.resolve(node.getPrefixIdentifier().get(), OCLVariableDeclarationSymbol.KIND);
            if(!varDecl.isPresent()) {
                varDecl = scope.resolve("this", OCLVariableDeclarationSymbol.KIND);
                names.push(node.getPrefixIdentifier().get());
            }
        } else if (node.isThis()) {
            varDecl = scope.resolve("this", OCLVariableDeclarationSymbol.KIND);
        } else if (node.isSuper()) {
            varDecl = scope.resolve("super", OCLVariableDeclarationSymbol.KIND);
        } else if (node.isRes()) {
            Log.error("Cannot infer type from result!", node.get_SourcePositionStart());
        }

        if(varDecl.isPresent()){
            CDTypeSymbolReference nameTypeRef = varDecl.get().getType();
            typeRef = handleNames(names, nameTypeRef, node);
            // Todo check method argument (postfixQualification)
        } else {
            Log.error("Could not resolve name, this or super!!", node.get_SourcePositionStart());
        }

        if(node.oCLQualifiedPrimaryIsPresent()) {
            typeRef = handleAdditionalQualifiedPrimaries(node.getOCLQualifiedPrimary().get(), typeRef);
        }

        returnTypeRef = typeRef;
    }


    /*
    @Override
    public void traverse(ASTOCLComprehensionPrimary node) {
        String typeName = "";
        int container = node.getContainer();
        if(container == 20) {
            typeName += "Set";
        } else if(container == 12) {
            typeName += "List";
        } else if(container == 1 || container == 0) {
            typeName += "Collection";
        }

        returnTypeRef = createTypeRef(typeName, node);

        CDTypeSymbolReference innerType = getTypeFromExpression(node.getExpression().get());
        addActualArgument(returnTypeRef, innerType);
    }*/


    /*
     *  ********** Helper Methods **********
     */

    private CDTypeSymbolReference createTypeRef(String typeName, ASTNode node) {
        typeName = mapPrimitiveType(typeName);
        CDTypeSymbolReference typeReference = new CDTypeSymbolReference(typeName, this.scope);
        typeReference.setStringRepresentation(typeName);

        if (!typeReference.existsReferencedSymbol()) {
            Log.error("The variable type does not exist: " + typeName, node.get_SourcePositionStart());
        }

        return typeReference;
    }

    private void addActualArgument(CDTypeSymbolReference typeReferenceOuter, CDTypeSymbolReference typeReferenceInner) {
        String stringRepresentation = typeReferenceOuter.getStringRepresentation() + "<";

        List<ActualTypeArgument> actualTypeArguments = new ArrayList<>();
        ActualTypeArgument actualTypeArgument = new ActualTypeArgument(typeReferenceInner);
        actualTypeArguments.add(actualTypeArgument);

        stringRepresentation +=  typeReferenceInner.getStringRepresentation() + ">";
        typeReferenceOuter.setStringRepresentation(stringRepresentation);
        typeReferenceOuter.setActualTypeArguments(actualTypeArguments);
    }

    public static String mapPrimitiveType(String type) {
        switch (type) {
            case "int":
                type = "Integer";
                break;
            case "double":
                type = "Double";
                break;
            case "float":
                type = "Float";
                break;
            case "char":
                type = "Character";
                break;
            case "boolean":
                type = "Boolean";
                break;
        }
        return type;
    }

    // Recursivly trace back the concatenation types
    private CDTypeSymbolReference handleNames(LinkedList<String> names, CDTypeSymbolReference previousType, ASTNode node) {
        CDTypeSymbolReference newType = previousType;
        if (names.size() > 0) {
            String name = names.pop();
            Scope elementsScope = previousType.getAllKindElements();

            Optional<CDFieldSymbol> fieldSymbol = elementsScope.<CDFieldSymbol>resolve(name, CDFieldSymbol.KIND);
            Optional<CDAssociationSymbol> associationSymbol = elementsScope.<CDAssociationSymbol>resolve(name, CDAssociationSymbol.KIND);
            Optional<CDMethodSymbol> methodSymbol = elementsScope.<CDMethodSymbol>resolve(name, CDMethodSymbol.KIND);

            if(fieldSymbol.isPresent()) { // Try name as field
                newType = createTypeRef(fieldSymbol.get().getType().getName(), node);
            } else if (associationSymbol.isPresent()) { // Try name as association
                newType = handleAssociationSymbol(node, associationSymbol);
            } else if (methodSymbol.isPresent()) { // Try name as method
                newType = createTypeRef(methodSymbol.get().getReturnType().getName(), node);
            } else {
                Log.error("Could not resolve name: " + name + " on " + previousType.getName(), node.get_SourcePositionStart());
            }

            newType = handleNames(names,newType, node);
        }
        return newType;
    }

    private CDTypeSymbolReference handleAssociationSymbol(ASTNode node, Optional<CDAssociationSymbol> associationSymbol) {
        CDTypeSymbolReference newType;
        CDTypeSymbolReference targetType = (CDTypeSymbolReference) associationSymbol.get().getTargetType();
        Cardinality cardinality = associationSymbol.get().getTargetCardinality();
        List<Stereotype> stereotypes = associationSymbol.get().getStereotypes();

        if (cardinality.isMultiple()) {
            if(stereotypes.stream().filter(s -> s.getName().equals("ordered")).count() > 0) {
                newType = createTypeRef("List", node);
            } else {
                newType = createTypeRef("Set", node);
            }
            addActualArgument(newType, targetType);
        } else if (!cardinality.isDefault()) {
            newType = createTypeRef("Optional", node);
            addActualArgument(newType, targetType);
        } else {
            newType = targetType;
        }
        return newType;
    }


    private CDTypeSymbolReference handleAdditionalQualifiedPrimaries(ASTOCLQualifiedPrimary node, CDTypeSymbolReference previousType) {
        Optional<OCLVariableDeclarationSymbol> varDecl = Optional.empty();
        LinkedList<String> names = new LinkedList<String>(node.getQualifications());
        names.push(node.getPrefixIdentifier().get());

        return handleNames(names, previousType, node);
    }


}
