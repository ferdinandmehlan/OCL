
package ocl.monticoreocl;

import java.util.Arrays;
import java.util.Collection;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import de.se_rwth.commons.SourcePosition;
import de.se_rwth.commons.logging.Finding;
import de.se_rwth.commons.logging.Log;
//import ocl.monticoreocl.lang.AbstractTest;
import ocl.monticoreocl.ocl._cocos.OCLCoCoChecker;
import ocl.monticoreocl.ocl._cocos.OCLCoCos;

public class MethSignatureStartsWithCapitalLetterTest extends AbstractOCLTest {

	@Override
	protected OCLCoCoChecker getChecker() {
		return OCLCoCos.createChecker();
	}

	@BeforeClass
	public static void init() {
		Log.enableFailQuick(false);
	}

	@Before
	public void setUp() {
		Log.getFindings().clear();
	}

	private static String MODEL_PATH_VALID = "src/test/resources/example/cocos/valid/";

	private static String MODEL_PATH_INVALID = "src/test/resources/example/cocos/invalid/";

	@Test
	public void testInvalidMethodSignatureName() {
		String modelName = "invalidMethSigName.ocl";
		String errorCode = "0xOCL10";

		Collection<Finding> expectedErrors = Arrays.asList(
				Finding.error(errorCode + " Method 'PersonalMsg' must start in lower-case.", new SourcePosition(2, 10)));
		testModelForErrors(MODEL_PATH_INVALID + modelName, expectedErrors);
	}

	@Test
	public void testValidMethodSignatureName() {

		String modelName = "validMethSigName.ocl";
		testModelNoErrors(MODEL_PATH_VALID + modelName);
	}

}
