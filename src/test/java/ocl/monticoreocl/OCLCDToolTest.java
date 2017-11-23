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


import ocl.monticoreocl.ocl.OCLCDTool;
import org.junit.Ignore;
import org.junit.Test;


public class OCLCDToolTest {

    @Ignore
    @Test
    public void testTool() {
        String parentpath = "D:\\6.Docs\\Git\\EmbeddedMontiArcProject\\OCL\\src\\test\\resources";
        String oclModel = "example.typeInferringModels.CDToolFile";
        //String oclModel = "example.OCLArtifactModel";
        String[] args = new String[]{parentpath, oclModel};
        OCLCDTool.main(args);
    }

}
