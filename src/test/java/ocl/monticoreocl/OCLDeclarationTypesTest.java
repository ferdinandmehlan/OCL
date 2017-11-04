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


import de.monticore.ModelingLanguageFamily;
import de.monticore.io.paths.ModelPath;
import de.monticore.symboltable.*;
import de.monticore.umlcd4a.CD4AnalysisLanguage;
import de.monticore.umlcd4a.cd4analysis._ast.ASTCDCompilationUnit;
import de.monticore.umlcd4a.cd4analysis._parser.CD4AnalysisParser;
import de.monticore.umlcd4a.symboltable.CD4AnalysisSymbolTableCreator;
import de.monticore.umlcd4a.symboltable.CDTypeSymbol;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._cocos.OCLCoCos;
import ocl.monticoreocl.ocl._parser.OCLParser;
import ocl.monticoreocl.ocl._symboltable.*;
import org.antlr.v4.runtime.RecognitionException;
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;

public class OCLDeclarationTypesTest extends AbstractOCLTest {

    @Override
    protected OCLCoCoChecker getChecker() {
        return OCLCoCos.createChecker();
    }

    @Test
    public void testCDModelCnC() throws IOException{
        CD4AnalysisParser parser = new CD4AnalysisParser();
        Path model = Paths.get("src/test/resources/de/monticore/montiarc/symboltable/MontiArc.cd");
        Optional<ASTCDCompilationUnit> root = parser.parseCDCompilationUnit(model.toString());
        assertFalse(parser.hasErrors());
        assertTrue(root.isPresent());
    }

    @Test
    public void testTypesPresent() {

        final GlobalScope globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/");

        final OCLFileSymbol oclFileSymbol = globalScope.<OCLFileSymbol> resolve("example.symbolTableTestFiles.test15", OCLFileSymbol.KIND).orElse(null);
        assertNotNull(oclFileSymbol);
        assertEquals(2, globalScope.getSubScopes().size());
        OCLInvariantSymbol oclInvariantSymbol = oclFileSymbol.getOCLInvariant("test15").orElse(null);
        assertNotNull(oclInvariantSymbol);

        OCLVariableDeclarationSymbol declVarSymbol = oclInvariantSymbol.getOCLVariableDecl("cmp").orElse(null);
        assertNotNull(declVarSymbol);
        assertEquals("Cmp", declVarSymbol.getVarTypeName());

        OCLVariableDeclarationSymbol declVarSymbol2 = oclInvariantSymbol.getOCLVariableDecl("ports").orElse(null);
        assertNotNull(declVarSymbol2);
        assertEquals("List", declVarSymbol2.getVarTypeName());
        assertEquals("List<Port>", declVarSymbol2.getType().getStringRepresentation());

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
        assertEquals("int", declVarSymbol5.getVarTypeName());
        assertEquals("int", declVarSymbol5.getType().getStringRepresentation());

        OCLVariableDeclarationSymbol declVarSymbol6 = oclInvariantSymbol.getOCLVariableDecl("p2").orElse(null);
        assertNotNull(declVarSymbol6);
        assertEquals("Port", declVarSymbol6.getVarTypeName());
        assertEquals("Port", declVarSymbol6.getType().getStringRepresentation());
    }

}
