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
import de.monticore.symboltable.Scope;
import de.se_rwth.commons.logging.Log;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._ast.ASTOCLInvariant;
import ocl.monticoreocl.ocl._parser.OCLParser;
import ocl.monticoreocl.ocl._symboltable.OCLFileSymbol;
import ocl.monticoreocl.ocl._symboltable.OCLLanguage;
import ocl.monticoreocl.ocl._symboltable.OCLSymbolTableCreator;
import ocl.monticoreocl.ocl._symboltable.OCLVariableDeclarationSymbol;
import org.antlr.v4.runtime.RecognitionException;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Optional;

public class SymboltableTest {

    @Test
    public void test() throws IOException{
        ASTCompilationUnit ast2 = parse("src/test/resources", "example/symbolTableTestFiles/test14");
        ASTOCLInvariant astInv = (ASTOCLInvariant)ast2.getOCLFile().getOclConstraints().get(0).getOCLRawConstraint();
        Scope scope = astInv.getEnclosingScope().get();
        Optional<OCLVariableDeclarationSymbol> symbol = scope.resolve("b", OCLVariableDeclarationSymbol.KIND);
        System.out.println(symbol);
    }

    protected ASTCompilationUnit parse(String parentDirectory, String modelPath)
            throws RecognitionException, IOException {
        String completePath = parentDirectory + File.separatorChar + modelPath + ".ocl";

        Log.debug("Parsing " + completePath, getClass().getName());
        Path path = FileSystems.getDefault().getPath(parentDirectory);
        ModelPath parentModelPath = new ModelPath(path);
        OCLLanguage oclLanguage = new OCLLanguage();
        ASTCompilationUnit astCompilationUnit = oclLanguage.getModelLoader()
                .loadModel(modelPath, parentModelPath).get();

        ModelingLanguageFamily modelingLanguageFamily = new ModelingLanguageFamily();
        modelingLanguageFamily.addModelingLanguage(oclLanguage);
        GlobalScope globalScope = new GlobalScope(parentModelPath, modelingLanguageFamily);

        OCLSymbolTableCreator symbolTableCreator = oclLanguage.getSymbolTableCreator(
                new ResolvingConfiguration(), globalScope).get();

        astCompilationUnit.accept(symbolTableCreator);
        // printScope(globalScope);
        return astCompilationUnit;
    }
}
