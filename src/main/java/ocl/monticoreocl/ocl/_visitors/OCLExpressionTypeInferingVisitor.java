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


import de.monticore.literals.literals._ast.ASTStringLiteral;
import de.monticore.symboltable.MutableScope;
import de.monticore.symboltable.Scope;
import de.monticore.symboltable.types.references.ActualTypeArgument;
import de.monticore.types.TypesPrinter;
import de.monticore.umlcd4a.symboltable.*;
import de.monticore.umlcd4a.symboltable.references.CDTypeSymbolReference;
import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.*;
import ocl.monticoreocl.ocl._symboltable.OCLVariableDeclarationSymbol;
import ocl.monticoreocl.ocl._visitor.OCLVisitor;
import siunit.monticoresiunit.si._ast.ASTNumber;
import siunit.monticoresiunit.si._ast.ASTUnitNumber;

import java.util.*;


/**
 * This visitor tries to infer the return type of an ocl expression
 */
public class OCLExpressionTypeInferingVisitor implements OCLVisitor {

    private CDTypeSymbolReference returnTypeRef;
    private OCLVisitor realThis = this;
    private MutableScope scope;

    public OCLExpressionTypeInferingVisitor(MutableScope scope) {
        this.returnTypeRef = null;
        this.scope = scope;
    }

    public static CDTypeSymbolReference getTypeFromExpression(ASTOCLNode node, MutableScope scope) {
        OCLExpressionTypeInferingVisitor exprVisitor = new OCLExpressionTypeInferingVisitor(scope);
        node.accept(exprVisitor);
        CDTypeSymbolReference typeReference = exprVisitor.getReturnTypeReference();
        if (typeReference==null) {
            Log.error("The variable type could not be resolved from the expression", node.get_SourcePositionStart());
            return new CDTypeSymbolReference("DefaultClass", exprVisitor.scope);
        } else {
            return typeReference;
        }
    }

    public CDTypeSymbolReference getReturnTypeReference() {
        return returnTypeRef;
    }

    private CDTypeSymbolReference createTypeRef(String typeName, ASTNode node) {
        // map int to Integer , etc.
        typeName = CDTypes.primitiveToWrapper(typeName);
        CDTypeSymbolReference typeReference = new CDTypeSymbolReference(typeName, this.scope);
        typeReference.setStringRepresentation(typeName);
        // Check if type was found in CD loaded CD models
        if (!typeReference.existsReferencedSymbol()) {
            Log.error("This type could not be found: " + typeName, node.get_SourcePositionStart());
        }
        return typeReference;
    }

    /**
     *  ********** traverse methods **********
     */

    @Override
    public void traverse(ASTOCLPrefixExpression node) {
        if(node.getOperator() != 0) { // operator:["-" | "+" | "~" | "!"]
            returnTypeRef = createTypeRef("Boolean", node);
        } else if (node.oCLPrimaryIsPresent()) {
            node.getOCLPrimary().get().accept(realThis);
        } else if (node.oCLTypeCastExpressionIsPresent()) {
            // Todo ?
        }
    }

    @Override
    public void traverse(ASTOCLNumberLiteral node) {
        ASTNumber astNumber = node.getValue();
        if(astNumber.unitNumberIsPresent()) {
            ASTUnitNumber unitNumber = astNumber.getUnitNumber().get();
            String unitString = unitNumber.getUnit().get().toString();
            if (unitString.equals("")) {
                if (unitNumber.getNumber().get().getDivisor().equals(1))
                    returnTypeRef = createTypeRef("int", node);
                else
                    returnTypeRef = createTypeRef("double", node);
            } else {
                returnTypeRef = createTypeRef("Amount", node); // From the jscience library
                // Todo: some method to get the unit class and add as an argument or Amount:  mW -> Amount<Power>
            }
        }
    }

    @Override
    public void traverse(ASTOCLNonNumberLiteral node) {
        if (node.getValue() instanceof ASTStringLiteral)
            returnTypeRef = createTypeRef("String", node);
        else
            returnTypeRef = createTypeRef("char", node);
    }

    @Override
    public void traverse(ASTOCLParenthizedExpr node) {
        returnTypeRef = getTypeFromExpression(node.getOCLExpression(), scope);
        if (node.qualificationIsPresent()) {
            node.getQualification().get().accept(realThis);
        }
    }

    @Override
    public void traverse(ASTOCLIfThenElseExpr node) {
        if (node.thenExpressionIsPresent()) {
            node.getThenExpression().get().accept(realThis);
        } else if (node.elseExpressionIsPresent()) {
            node.getElseExpression().get().accept(realThis);
        }
    }

    @Override
    public void traverse(ASTOCLConditionalExpr node) {
        node.getThenExpression().accept(realThis);
    }

    @Override
    public void traverse(ASTOCLConcatenation node) {
        LinkedList<String> names = new LinkedList<>(node.getNames());
        String firstName = node.getNames().get(0);

        // Try and look if name or this was declared as variable or try as ClassName of CD
        Optional<OCLVariableDeclarationSymbol> nameDecl = scope.resolve(firstName, OCLVariableDeclarationSymbol.KIND);
        Optional<OCLVariableDeclarationSymbol> thisDecl = scope.resolve("this", OCLVariableDeclarationSymbol.KIND);
        Optional<CDTypeSymbol> className = scope.resolve(firstName, CDTypeSymbol.KIND);
        if(returnTypeRef!=null) {
            returnTypeRef = handleNames(names, returnTypeRef, node);
        } else if(nameDecl.isPresent()) {
            names.pop();
            CDTypeSymbolReference typeRef = nameDecl.get().getType();
            returnTypeRef = handleNames(names, typeRef, node);
        } else if (className.isPresent()) {
            names.pop();
            CDTypeSymbolReference typeRef = createTypeRef("Set", node);
            CDTypeSymbolReference argsTypeRef = createTypeRef(firstName, node);
            addActualArgument(typeRef, argsTypeRef);
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
            String firstName = node.getPrefixIdentifier().get();
            varDecl = scope.resolve(firstName, OCLVariableDeclarationSymbol.KIND);
            Optional<CDTypeSymbolReference> className = scope.resolve(firstName, CDTypeSymbolReference.KIND);

            if(returnTypeRef!=null) {
                names.push(firstName);
                typeRef = handleNames(names, returnTypeRef, node);
            } else
            if(!varDecl.isPresent() && className.isPresent()) {
                CDTypeSymbolReference nameTypeRef = createTypeRef("Set", node);
                CDTypeSymbolReference argsTypeRef = createTypeRef(firstName, node);
                addActualArgument(nameTypeRef, argsTypeRef);
                typeRef = handleNames(names, nameTypeRef, node);
            } else
            if(!varDecl.isPresent() && !className.isPresent()) {
                varDecl = scope.resolve("this", OCLVariableDeclarationSymbol.KIND);
                names.push(firstName);
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
            // Todo check method argument or ** or @pre (postfixQualification)
        }
        if(!varDecl.isPresent() && returnTypeRef==null && typeRef==null) {
            Log.error("Could not resolve name, this or super!", node.get_SourcePositionStart());
        }

        if(node.oCLQualifiedPrimaryIsPresent()) {
            typeRef = handleAdditionalQualifiedPrimaries(node.getOCLQualifiedPrimary().get(), typeRef);
        }

        returnTypeRef = typeRef;
    }

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

        CDTypeSymbolReference innerType = getTypeFromExpression(node.getExpression().get(), scope);
        if (!innerType.getName().equals("Object")) {
            addActualArgument(returnTypeRef, innerType);
        }

        if (node.qualificationIsPresent()) {
            node.getQualification().get().accept(realThis);
        }
    }

    @Override
    public void traverse(ASTOCLComprehensionExpressionStyle node) {
        node.getOCLExpression().accept(realThis);
    }

    @Override
    public void traverse(ASTOCLComprehensionEnumerationStyle node) {
        if (node.getOCLCollectionItems().isEmpty()) {
            returnTypeRef = createTypeRef("Object", node);
        } else {
            node.getOCLCollectionItems(0).getOCLExpressions(0).accept(realThis);
        }
    }

    @Override
    public void traverse(ASTOCLComprehensionVarDeclaratorStyle node) {
        node.getGenerator().getOCLInExpr().get().accept(realThis);
    }

    @Override
    public void traverse(ASTOCLInExpr node) {
        if (node.oCLInWithTypeIsPresent()) {
            ASTOCLInWithType inWithType = node.getOCLInWithType().get();
            String typeName;
            if(inWithType.classNameIsPresent()) {
                typeName = inWithType.getClassName().get();
            } else {
                typeName = TypesPrinter.printType(inWithType.getType().get());
            }
            returnTypeRef = createTypeRef(typeName, node);
        } else if (node.oCLInWithOutTypeIsPresent()) {
            ASTOCLInWithOutType inWithOutType = node.getOCLInWithOutType().get();
            CDTypeSymbolReference containerType = null;
            if(inWithOutType.oCLPrimaryIsPresent()) {
                containerType = getTypeFromExpression(inWithOutType.getOCLPrimary().get(), scope);
            } else if(inWithOutType.expressionIsPresent()) {
                containerType = getTypeFromExpression(inWithOutType.getExpression().get(), scope);
            }
            if (containerType.getActualTypeArguments().size() == 0) {
                Log.error("Could not resolve type from InExpression, " + inWithOutType.getName() +
                        " in " + containerType, node.get_SourcePositionStart());
            }
            returnTypeRef = (CDTypeSymbolReference) containerType.getActualTypeArguments().get(0).getType();
        }
    }

    /**
     *  ********** boolean expressions **********
     */

    @Override
    public void traverse(ASTOCLEquivalentExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLDoubleLogicalAND node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLIsin node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLImplies node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLCompare node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLShiftExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLBinaryPlusMinusExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLBinaryMultDivModExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLDoubleLogicalORExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLSingleLogicalORExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLLogicalXORExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLSingleLogicalANDExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLRelationalExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    @Override
    public void traverse(ASTOCLInstanceofExpr node) {
        returnTypeRef = createTypeRef("boolean", node);
    }

    /**
     *  ********** Helper Methods **********
     */



    private void addActualArgument(CDTypeSymbolReference typeReferenceOuter, CDTypeSymbolReference typeReferenceInner) {
        String stringRepresentation = typeReferenceOuter.getStringRepresentation() + "<";

        List<ActualTypeArgument> actualTypeArguments = new ArrayList<>();
        ActualTypeArgument actualTypeArgument = new ActualTypeArgument(typeReferenceInner);
        actualTypeArguments.add(actualTypeArgument);

        stringRepresentation +=  typeReferenceInner.getStringRepresentation() + ">";
        typeReferenceOuter.setStringRepresentation(stringRepresentation);
        typeReferenceOuter.setActualTypeArguments(actualTypeArguments);
    }

    /**
     * Takes a chain of names and recursivly traces back the return type: Class.field.association.method().
     * E.g. Auction.members.size() -> int
     * Implicit flattening is used: E.g a type of List<List<Person>>> is also looked at as List<Person>
     */
    private CDTypeSymbolReference handleNames(LinkedList<String> names, CDTypeSymbolReference previousType, ASTNode node) {
        if (names.size() > 0) {
            String name = names.pop();
            // Try name as method/field/assoc
            Scope elementsScope = previousType.getAllKindElements();
            CDTypeSymbolReference newType = handleName(node, name, elementsScope);
            // Try again and flatten container
            if (newType==null) {
                //flatten previous type
                elementsScope = flattenType(previousType).getAllKindElements();
                newType = handleName(node, name, elementsScope);
                if(newType== null) {
                    Log.error("Could not resolve field/method/association: " + name + " on " + previousType.getName(), node.get_SourcePositionStart());
                }
            }
            return handleNames(names,newType, node);
        } else {
            return previousType;
        }
    }

    // Todo flatten Optional<...Optional<X> to X and sets and lists
    private CDTypeSymbolReference flattenType(CDTypeSymbolReference previousType) {
        String typeName = previousType.getName();
        List<ActualTypeArgument> arguments = previousType.getActualTypeArguments();
        if (typeName.equals("Optional") && !arguments.isEmpty()) {
            return (CDTypeSymbolReference) arguments.get(0).getType();
        } else if (typeName.equals("Set")) {
            return (CDTypeSymbolReference) arguments.get(0).getType();
        } else if (typeName.equals("List")) {
            return (CDTypeSymbolReference) arguments.get(0).getType();
        }
        return previousType;
    }

    /**
     * Takes a single name and tries to resolve it as association/field/method on a scope
     */
    private CDTypeSymbolReference handleName(ASTNode node, String name, Scope elementsScope) {
        Optional<CDFieldSymbol> fieldSymbol = elementsScope.<CDFieldSymbol>resolve(name, CDFieldSymbol.KIND);
        Collection<CDAssociationSymbol> associationSymbol = elementsScope.<CDAssociationSymbol>resolveMany(name, CDAssociationSymbol.KIND);
        Optional<CDMethodSymbol> methodSymbol = elementsScope.<CDMethodSymbol>resolve(name, CDMethodSymbol.KIND);

        if(fieldSymbol.isPresent()) { // Try name as field
            return createTypeRef(fieldSymbol.get().getType().getName(), node);
        } else if (!associationSymbol.isEmpty()) { // Try name as association
            return handleAssociationSymbol(node, associationSymbol.iterator().next(), name);
        } else if (methodSymbol.isPresent()) { // Try name as method
            return createTypeRef(methodSymbol.get().getReturnType().getName(), node);
        } else {
            return null;
        }
    }

    private CDTypeSymbolReference handleAssociationSymbol(ASTNode node, CDAssociationSymbol associationSymbol, String roleName) {
        CDTypeSymbolReference newType;
        CDTypeSymbolReference targetType = (CDTypeSymbolReference) associationSymbol.getTargetType();
        Cardinality cardinality = associationSymbol.getTargetCardinality();
        List<Stereotype> stereotypes = associationSymbol.getStereotypes();
        if(associationSymbol.getSourceRole().isPresent() && associationSymbol.getSourceRole().get().equals(roleName)) {
            targetType = (CDTypeSymbolReference) associationSymbol.getSourceType();
            cardinality = associationSymbol.getSourceCardinality();
        }

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
