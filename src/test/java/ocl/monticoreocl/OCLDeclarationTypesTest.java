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
package ocl.monticoreocl;


import de.monticore.symboltable.*;
import de.monticore.umlcd4a.cd4analysis._ast.ASTCDCompilationUnit;
import de.monticore.umlcd4a.cd4analysis._parser.CD4AnalysisParser;
import de.monticore.umlcd4a.symboltable.*;
import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._cocos.OCLCoCos;
import ocl.monticoreocl.ocl._symboltable.*;
import org.junit.Ignore;
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;

public class OCLDeclarationTypesTest extends AbstractOCLTest {

    @Override
    protected OCLCoCoChecker getChecker() {
        return OCLCoCos.createChecker();
    }

    @Test
    public void testCDModelCnC() throws IOException{
        CD4AnalysisParser parser = new CD4AnalysisParser();
        Path model = Paths.get("src/test/resources/example/CDs/MontiArc.cd");
        Optional<ASTCDCompilationUnit> root = parser.parseCDCompilationUnit(model.toString());
        assertFalse(parser.hasErrors());
        assertTrue(root.isPresent());
    }

    @Test
    public void testTypesPresent() {

        final GlobalScope globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/");

        final OCLFileSymbol oclFileSymbol = globalScope.<OCLFileSymbol> resolve("example.symbolTableTestFiles.test15", OCLFileSymbol.KIND).orElse(null);
        assertNotNull(oclFileSymbol);
        assertEquals(3, globalScope.getSubScopes().size());
        OCLInvariantSymbol oclInvariantSymbol = oclFileSymbol.getOCLInvariant("test15").orElse(null);
        assertNotNull(oclInvariantSymbol);

        OCLVariableDeclarationSymbol declVarSymbol = oclInvariantSymbol.getOCLVariableDecl("cmp").orElse(null);
        assertNotNull(declVarSymbol);
        assertEquals("Cmp", declVarSymbol.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol2 = oclInvariantSymbol.getOCLVariableDecl("ports").orElse(null);
        assertNotNull(declVarSymbol2);
        assertEquals("List", declVarSymbol2.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol2.getType().getStringRepresentation());
        assertEquals(1, declVarSymbol2.getType().getActualTypeArguments().size());
        assertEquals("Port", declVarSymbol2.getType().getActualTypeArguments().get(0).getType().toString());

        OCLVariableDeclarationSymbol declVarSymbol3 = oclInvariantSymbol.getOCLVariableDecl("ports2").orElse(null);
        assertNotNull(declVarSymbol3);
        assertEquals("List", declVarSymbol3.getVarTypeName());
        assertEquals("List<List<Port>>", declVarSymbol3.getType().getStringRepresentation());

        OCLVariableDeclarationSymbol declVarSymbol4 = oclInvariantSymbol.getOCLVariableDecl("port1").orElse(null);
        assertNotNull(declVarSymbol4);
        assertEquals("Port", declVarSymbol4.getVarTypeName());
        assertEquals("Port", declVarSymbol4.getType().getStringRepresentation());

        OCLVariableDeclarationSymbol declVarSymbol5 = oclInvariantSymbol.getOCLVariableDecl("i").orElse(null);
        assertNotNull(declVarSymbol5);
        assertEquals("Integer", declVarSymbol5.getVarTypeName());
        assertEquals("int", declVarSymbol5.getType().getStringRepresentation());

        OCLVariableDeclarationSymbol declVarSymbol6 = oclInvariantSymbol.getOCLVariableDecl("p2").orElse(null);
        assertNotNull(declVarSymbol6);
        assertEquals("Port", declVarSymbol6.getVarTypeName());
        assertEquals("Port", declVarSymbol6.getType().getStringRepresentation());
    }


    @Test
    public void testTypesNotPresent() {

        final GlobalScope globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/");

        final OCLFileSymbol oclFileSymbol = globalScope.<OCLFileSymbol> resolve("example.symbolTableTestFiles.test16", OCLFileSymbol.KIND).orElse(null);
        assertNotNull(oclFileSymbol);
        assertEquals(3, globalScope.getSubScopes().size());
        OCLInvariantSymbol oclInvariantSymbol = oclFileSymbol.getOCLInvariant("test16").orElse(null);
        assertNotNull(oclInvariantSymbol);

        OCLVariableDeclarationSymbol declVarSymbol = oclInvariantSymbol.getOCLVariableDecl("numberUnit").orElse(null);
        assertNotNull(declVarSymbol);
        assertEquals("Amount", declVarSymbol.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol2 = oclInvariantSymbol.getOCLVariableDecl("number").orElse(null);
        assertNotNull(declVarSymbol2);
        assertEquals("Double", declVarSymbol2.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol3 = oclInvariantSymbol.getOCLVariableDecl("cmp2").orElse(null);
        assertNotNull(declVarSymbol3);
        assertEquals("Cmp", declVarSymbol3.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol4 = oclInvariantSymbol.getOCLVariableDecl("ports").orElse(null);
        assertNotNull(declVarSymbol4);
        assertEquals("List", declVarSymbol4.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol4.getType().getStringRepresentation());
        assertEquals(1, declVarSymbol4.getType().getActualTypeArguments().size());
        assertEquals("Port", declVarSymbol4.getType().getActualTypeArguments().get(0).getType().toString());
/*
        OCLVariableDeclarationSymbol declVarSymbol5 = oclInvariantSymbol.getOCLVariableDecl("ports2").orElse(null);
        assertNotNull(declVarSymbol5);
        assertEquals("List", declVarSymbol5.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol5.getType().getStringRepresentation());
        assertEquals(1, declVarSymbol5.getType().getActualTypeArguments().size());
        assertEquals("Port", declVarSymbol5.getType().getActualTypeArguments().get(0).getType().toString());

        OCLVariableDeclarationSymbol declVarSymbol6 = oclInvariantSymbol.getOCLVariableDecl("ports3").orElse(null);
        assertNotNull(declVarSymbol6);
        assertEquals("List", declVarSymbol6.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol6.getType().getStringRepresentation());
        assertEquals(1, declVarSymbol6.getType().getActualTypeArguments().size());
        assertEquals("Port", declVarSymbol6.getType().getActualTypeArguments().get(0).getType().toString());
        */
    }

    @Test
    public void testTypesNotPresent2() {

        final GlobalScope globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/");

        final OCLFileSymbol oclFileSymbol = globalScope.<OCLFileSymbol> resolve("example.symbolTableTestFiles.test17", OCLFileSymbol.KIND).orElse(null);
        assertNotNull(oclFileSymbol);
        assertEquals(3, globalScope.getSubScopes().size());
        OCLInvariantSymbol oclInvariantSymbol = oclFileSymbol.getOCLInvariant("test17").orElse(null);
        assertNotNull(oclInvariantSymbol);

        OCLVariableDeclarationSymbol declVarSymbol = oclInvariantSymbol.getOCLVariableDecl("s").orElse(null);
        assertNotNull(declVarSymbol);
        assertEquals("Integer", declVarSymbol.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol2 = oclInvariantSymbol.getOCLVariableDecl("p").orElse(null);
        assertNotNull(declVarSymbol2);
        assertEquals("List", declVarSymbol2.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol2.getType().getStringRepresentation());
        assertEquals(1, declVarSymbol2.getType().getActualTypeArguments().size());
        assertEquals("Port", declVarSymbol2.getType().getActualTypeArguments().get(0).getType().toString());
    }

    @Test
    public void newTest() {
        final GlobalScope globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/");

        CDTypeSymbol s = globalScope.<CDTypeSymbol>resolve("example.ArtifactModel.Event", CDTypeSymbol.KIND).orElse(null);
        assertNotNull(s);

        Scope s2 = s.getAllKindElements();
        CDAssociationSymbol sym = s2.<CDAssociationSymbol>resolve("subaction", CDAssociationSymbol.KIND).orElse(null);
        assertNotNull(sym);
        CDAssociationSymbol sym2 = s2.<CDAssociationSymbol>resolve("sub", CDAssociationSymbol.KIND).get();
        assertNotNull(sym2);



    }
}
