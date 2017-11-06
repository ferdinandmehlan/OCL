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
import de.monticore.symboltable.Scope;
import de.monticore.symboltable.types.references.ActualTypeArgument;
import de.monticore.umlcd4a.cd4analysis._ast.ASTCardinality;
import de.monticore.umlcd4a.symboltable.CDAssociationSymbol;
import de.monticore.umlcd4a.symboltable.CDTypeSymbol;
import de.monticore.umlcd4a.symboltable.Cardinality;
import de.monticore.umlcd4a.symboltable.references.CDTypeSymbolReference;
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
    private OCLSymbolTableCreator symTabCreator;
    private Scope scope;

    public OCLExpressionTypeInferingVisitor(OCLSymbolTableCreator symTabCreator) {
        this.returnTypeRef = null;
        this.symTabCreator = symTabCreator;
        this.scope = symTabCreator.currentScope().get();
    }

    public CDTypeSymbolReference getReturnTypeReference() {
        return returnTypeRef;
    }


    private CDTypeSymbolReference createTypeRef(String typeName, ASTNode node) {
        CDTypeSymbolReference typeReference = new CDTypeSymbolReference(typeName, this.scope);
        typeReference.setStringRepresentation(typeName);
        if (!typeReference.existsReferencedSymbol()) {
            Log.error("The variable type does not exist: " + typeName, node.get_SourcePositionStart());
        }

        return typeReference;
    }

    @Override
    public void traverse(final ASTOCLVariableDeclaration node) {
        symTabCreator.visit(node);
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
        LinkedList<String> names = new LinkedList(node.getNames());
        String firstName = names.pop();

        // Try and look if prefix was declared as Variable
        Optional<OCLVariableDeclarationSymbol> oclDecl = scope.resolve(firstName, OCLVariableDeclarationSymbol.KIND);
        if(oclDecl.isPresent()) {
            CDTypeSymbol type = oclDecl.get().getType().getReferencedSymbol();
            returnTypeRef = handleConcatNames(names, type, node);
        }
    }

    protected CDTypeSymbolReference handleConcatNames(LinkedList<String> names, CDTypeSymbol type, ASTOCLConcatenation node) {
        CDTypeSymbolReference typeReference = createTypeRef(type.getName(), node);;
        if(names.size() > 0) {
            String name = names.pop();
            CDAssociationSymbol associationSymbol = getAssociation(type, name).get();
            type = associationSymbol.getTargetType();
            Cardinality cardinality = associationSymbol.getTargetCardinality();
            if (cardinality.isMultiple()) {
                //Todo  check if List/Set/collection
                typeReference = createTypeRef("List", node);
                addActualArgument(typeReference, handleConcatNames(names, type, node));
            } else if (!cardinality.isDefault()) {
                typeReference = createTypeRef("Optional", node);
                addActualArgument(typeReference, handleConcatNames(names, type, node));
            } else {
                typeReference = handleConcatNames(names, type, node);
            }
        }
        return typeReference;
    }



    /*
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

    // Todo push this function to cd4analysis
    private Optional<CDAssociationSymbol> getAssociation(CDTypeSymbol ref, String name) {
        // no check for reference required
        return ref.getAssociations().stream()
                .filter(a -> a.getName().equals(name))
                .findFirst();
    }

}
