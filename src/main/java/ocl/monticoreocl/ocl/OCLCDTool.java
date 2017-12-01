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
package ocl.monticoreocl.ocl;


import de.monticore.ModelingLanguageFamily;
import de.monticore.io.paths.ModelPath;
import de.monticore.symboltable.GlobalScope;
import de.monticore.symboltable.ResolvingConfiguration;
import de.monticore.symboltable.Scope;
import de.monticore.umlcd4a.CD4AnalysisLanguage;
import ocl.LogConfig;
import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._symboltable.OCLLanguage;
import ocl.monticoreocl.ocl._symboltable.OCLSymbolTableCreator;
import org.antlr.v4.runtime.RecognitionException;

import org.apache.commons.cli.*;

import java.nio.file.Paths;
import java.util.Optional;

public class OCLCDTool {



    public static void main(String[] args) throws Exception{

        Options options = new Options();

        Option path = new Option("path", "project-path", true, "absolute path to project: C:\\path\\to\\my\\project");
        path.setRequired(true);
        options.addOption(path);
/*
        Option cd = new Option("cd", "classdiagram", true, "input classdiagram as qualified name: de.monticore.myCd");
        cd.setRequired(true);
        options.addOption(cd);
*/
        Option ocl = new Option("ocl", "ocl-file", true, "input ocl-file as qualified name: de.monticoreocl.myConstraint");
        ocl.setRequired(true);
        options.addOption(ocl);

        CommandLineParser parser = new BasicParser();
        HelpFormatter formatter = new HelpFormatter();
        CommandLine cmd;

        try {
            cmd = parser.parse(options, args);
        } catch (ParseException e) {
            System.out.println(e.getMessage());
            formatter.printHelp("java -jar OCLCDTool", options);
            System.exit(1);
            return;
        }

        String parentDir = cmd.getOptionValue("path");
        System.out.println("ParentDir loaded as: " + parentDir);
        String oclModel = cmd.getOptionValue("ocl");
        System.out.println("OCL loaded as: " + oclModel);

        loadModel(parentDir, oclModel);
        System.out.println("OCL Model loaded successfully!");
    }

    protected static ASTCompilationUnit loadModel(String parentDirectory, String modelFullQualifiedFilename) {
        final OCLLanguage ocllang = new OCLLanguage();
        final CD4AnalysisLanguage cd4AnalysisLang = new CD4AnalysisLanguage();

        LogConfig.init();
        try {
            ModelPath modelPath = new ModelPath(Paths.get(parentDirectory));
            ModelingLanguageFamily modelingLanguageFamily = new ModelingLanguageFamily();
            modelingLanguageFamily.addModelingLanguage(ocllang);
            modelingLanguageFamily.addModelingLanguage(cd4AnalysisLang);
            GlobalScope globalScope = new GlobalScope(modelPath, modelingLanguageFamily);

            ResolvingConfiguration resolvingConfiguration = new ResolvingConfiguration();
            resolvingConfiguration.addDefaultFilters(ocllang.getResolvers());
            resolvingConfiguration.addDefaultFilters(cd4AnalysisLang.getResolvers());

            OCLSymbolTableCreator oclSymbolTableCreator = ocllang.getSymbolTableCreator(resolvingConfiguration, globalScope).get();
            Optional<ASTCompilationUnit> astOCLCompilationUnit = ocllang.getModelLoader().loadModel(modelFullQualifiedFilename, modelPath);

            if(astOCLCompilationUnit.isPresent()) {
                astOCLCompilationUnit.get().accept(oclSymbolTableCreator);
                Scope cdScope = globalScope.getSubScopes().get(0).getSubScopes().get(0);
                return astOCLCompilationUnit.get();
            }
        } catch (RecognitionException e) {
            e.printStackTrace();
        }
        throw new RuntimeException("Error during loading of model " + modelFullQualifiedFilename + ".");
    }
}
