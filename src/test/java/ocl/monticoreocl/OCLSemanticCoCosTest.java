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
import de.monticore.symboltable.GlobalScope;
import de.monticore.symboltable.ResolvingConfiguration;
import de.monticore.symboltable.SymbolKind;
import de.monticore.umlcd4a.CD4AnalysisLanguage;
import de.monticore.umlcd4a.cd4analysis._ast.ASTCDCompilationUnit;
import de.monticore.umlcd4a.cd4analysis._parser.CD4AnalysisParser;
import de.monticore.umlcd4a.symboltable.CD4AnalysisSymbolTableCreator;
import de.monticore.umlcd4a.symboltable.CDTypeSymbol;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._parser.OCLParser;
import ocl.monticoreocl.ocl._symboltable.OCLFileSymbol;
import ocl.monticoreocl.ocl._symboltable.OCLLanguage;
import ocl.monticoreocl.ocl._symboltable.OCLSymbolTableCreator;
import org.antlr.v4.runtime.RecognitionException;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class OCLSemanticCoCosTest {

    @Test
    public void testCDModelCnC() throws IOException{
        CD4AnalysisParser parser = new CD4AnalysisParser();
        Path model = Paths.get("src/test/resources/de/monticore/montiarc/symboltable/MontiArc.cd");
        Optional<ASTCDCompilationUnit> root = parser.parseCDCompilationUnit(model.toString());
        assertFalse(parser.hasErrors());
        assertTrue(root.isPresent());
    }

    @Test
    public void testSymboltable() throws RecognitionException, IOException {

        ModelPath modelPath = new ModelPath(Paths.get("src/test/resources"), Paths.get("src/test/resources/example/symbolTableTestFiles"));
        OCLLanguage oclLanguage = new OCLLanguage();
        CD4AnalysisLanguage cd4AnalysisLanguage = new CD4AnalysisLanguage();
        ModelingLanguageFamily modelingLanguageFamily = new ModelingLanguageFamily();
        modelingLanguageFamily.addModelingLanguage(oclLanguage);
        modelingLanguageFamily.addModelingLanguage(cd4AnalysisLanguage);
        GlobalScope globalScope = new GlobalScope(modelPath, modelingLanguageFamily);

/*
        ResolvingConfiguration resolvingConfiguration = new ResolvingConfiguration();

        CD4AnalysisSymbolTableCreator cd4AnalysisSymbolTableCreator = cd4AnalysisLanguage.getSymbolTableCreator(resolvingConfiguration, globalScope).get();
        Optional<ASTCDCompilationUnit> astCDCompilationUnit = cd4AnalysisLanguage.getModelLoader().loadModel("de.monticore.montiarc.symboltable.MontiArc", modelPath);
        astCDCompilationUnit.get().accept(cd4AnalysisSymbolTableCreator);

        CDTypeSymbol  typeSymbol = globalScope.<CDTypeSymbol>resolve("de.monticore.montiarc.symboltable.MontiArc.Cmp", CDTypeSymbol.KIND).orElse(null);

        OCLSymbolTableCreator oclSymbolTableCreator = oclLanguage.getSymbolTableCreator(resolvingConfiguration, globalScope).get();
        Optional<ASTCompilationUnit> astOCLCompilationUnit = oclLanguage.getModelLoader().loadModel("test15", modelPath);
        astOCLCompilationUnit.get().accept(oclSymbolTableCreator);

*/


         globalScope = OCLGlobalScopeTestFactory.create("src/test/resources/example/symbolTableTestFiles");
        final OCLFileSymbol oclFileSymbol = globalScope.<OCLFileSymbol> resolve("test15", OCLFileSymbol.KIND).orElse(null);
        assertNotNull(oclFileSymbol);

    }
}
