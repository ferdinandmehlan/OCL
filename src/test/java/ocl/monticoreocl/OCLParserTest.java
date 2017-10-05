
package ocl.monticoreocl;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import de.se_rwth.commons.logging.Log;
import org.antlr.v4.runtime.RecognitionException;
import org.junit.Ignore;
import org.junit.Test;

import ocl.monticoreocl.ocl._ast.ASTCompilationUnit;
import ocl.monticoreocl.ocl._parser.OCLParser;

public class OCLParserTest {


	private void test(Path model) throws RecognitionException, IOException {
		OCLParser parser = new OCLParser();
		Optional<ASTCompilationUnit> cdDef = parser.parse(model.toString());
		assertFalse(parser.hasErrors());
		assertTrue(cdDef.isPresent());
		Log.debug(cdDef.toString(), "OCLParserTest");
	}

	@Test
	public void testAssociation1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/association1.ocl");
		test(model);
	}

	@Test
	public void testAssociation2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/association2.ocl");
		test(model);
	}

	@Test
	public void testCases1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/cases1.ocl");
		test(model);
	}

	@Test
	public void testCases2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/cases2.ocl");
		test(model);
	}

	@Test
	public void testComprehension1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension1.ocl");
		test(model);
	}

	@Test
	public void testComprehension2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension2.ocl");
		test(model);
	}

	@Test
	public void testComprehension3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension3.ocl");
		test(model);
	}

	@Test
	public void testComprehension4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension4.ocl");
		test(model);
	}

	@Test
	public void testComprehension5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension5.ocl");
		test(model);
	}

	@Test
	public void testComprehension6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension6.ocl");
		test(model);	}

	@Test
	public void testComprehension7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension7.ocl");
		test(model);	}

	@Test
	public void testComprehension8() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension8.ocl");
		test(model);	}

	@Test
	public void testComprehension9() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension9.ocl");
		test(model);	}

	@Test
	public void testComprehension10() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension10.ocl");
		test(model);	}

	@Test
	public void testComprehension11() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension11.ocl");
		test(model);	}

	@Test
	public void testComprehension12() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension12.ocl");
		test(model);	}

	@Test
	public void testComprehension13() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/comprehension13.ocl");
		test(model);	}

	@Test
	public void testContext1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context1.ocl");
		test(model);
	}

	@Test
	public void testContext2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context2.ocl");
		test(model);
	}

	@Test
	public void testContext3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context3.ocl");
		test(model);
	}

	@Test
	public void testContext4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context4.ocl");
		test(model);
	}

	@Test
	public void testContext5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context5.ocl");
		test(model);
	}

	@Test
	public void testContext6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context6.ocl");
		test(model);
	}

	@Test
	public void testContext7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context7.ocl");
		test(model);
	}

	@Test
	public void testContext8() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context8.ocl");
		test(model);
	}

	@Test
	public void testContext9() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/context9.ocl");
		test(model);
	}

	@Test
	public void testContainer1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/container1.ocl");
		test(model);
	}

	@Test
	public void testContainer2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/container2.ocl");
		test(model);
	}

	@Test
	public void testContainer3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/container3.ocl");
		test(model);
	}

	@Test
	public void testLet1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/let1.ocl");
		test(model);
	}

	@Test
	public void testLet2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/let2.ocl");
		test(model);
	}

	@Test
	public void testLet3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/let3.ocl");
		test(model);
	}

	@Test
	public void testLet4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/let4.ocl");
		test(model);
	}

	@Test
	public void testNumbers1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers1.ocl");
		test(model);
	}

	@Test
	public void testNumbers2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers2.ocl");
		test(model);
	}

	@Test
	public void testNumbers3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers3.ocl");
		test(model);
	}

	@Test
	public void testNumbers4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers4.ocl");
		test(model);
	}

	@Test
	public void testNumbers5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers5.ocl");
		test(model);
	}

	@Test
	public void testNumbers6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/numbers6.ocl");
		test(model);
	}

	@Test
	public void testPrePost1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost1.ocl");
		test(model);
	}

	@Test
	public void testPrePost2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost2.ocl");
		test(model);
	}

	@Test
	public void testPrePost3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost3.ocl");
		test(model);
	}

	@Test
	public void testPrePost5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost5.ocl");
		test(model);
	}

	@Test
	public void testPrePost4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost4.ocl");
		test(model);
	}

	@Test
	public void testPrePost6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost6.ocl");
		test(model);
	}

	@Test
	public void testPrePost7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost7.ocl");
		test(model);
	}

	@Test
	public void testPrePost8() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost8.ocl");
		test(model);
	}

	@Test
	public void testPrePost9() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost9.ocl");
		test(model);
	}

	@Test
	public void testPrePost10() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost10.ocl");
		test(model);
	}

	@Test
	public void testPrePost11() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost11.ocl");
		test(model);
	}

	@Test
	public void testPrePost12() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost12.ocl");
		test(model);
	}

	@Test
	public void testPrePost13() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/prepost13.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers1.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers2.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers3.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers4.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers5.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers6.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers7.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers8() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers8.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers9() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers9.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers10() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers10.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers11() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers11.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers12() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers12.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers13() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers13.ocl");
		test(model);
	}

	@Test
	public void testQuantifiers14() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/quantifiers14.ocl");
		test(model);
	}

	@Test
	public void testQuery1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/query1.ocl");
		test(model);
	}

	@Test
	public void testQuery2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/query2.ocl");
		test(model);
	}

	@Test
	public void testSetOperations1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations1.ocl");
		test(model);
	}

	@Test
	public void testSetOperations2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations2.ocl");
		test(model);
	}

	@Test
	public void testSetOperations3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations3.ocl");
		test(model);
	}

	@Test
	public void testSetOperations4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations4.ocl");
		test(model);
	}

	@Test
	public void testSetOperations5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations5.ocl");
		test(model);
	}

	@Test
	public void testSetOperations6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations6.ocl");
		test(model);
	}

	@Test
	public void testSetOperations7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations7.ocl");
		test(model);
	}

	@Test
	public void testSetOperations8() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations8.ocl");
		test(model);
	}

	@Test
	public void testSetOperations9() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations9.ocl");
		test(model);
	}

	@Test
	public void testSetOperations10() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations10.ocl");
		test(model);
	}

	@Test
	public void testSetOperations11() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations11.ocl");
		test(model);
	}

	@Test
	public void testSetOperations12() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations12.ocl");
		test(model);
	}

	@Test
	public void testSetOperations13() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations13.ocl");
		test(model);
	}

	@Test
	public void testSetOperations14() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations14.ocl");
		test(model);
	}

	@Test
	public void testSetOperations15() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations15.ocl");
		test(model);
	}

	@Test
	public void testSetOperations16() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/setoperations16.ocl");
		test(model);
	}

	@Test
	public void testSor1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor1.ocl");
		test(model);
	}

	@Test
	public void testSor2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor2.ocl");
		test(model);
	}

	@Test
	public void testSor3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor3.ocl");
		test(model);
	}

	@Test
	public void testSor4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor4.ocl");
		test(model);
	}

	@Test
	public void testSor5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor5.ocl");
		test(model);
	}

	@Test
	public void testSor6() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor6.ocl");
		test(model);
	}

	@Test
	public void testSor7() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/sor7.ocl");
		test(model);
	}

	@Test
	public void testSpecial1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/special1.ocl");
		test(model);
	}

	@Test
	public void testSpecial2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/special2.ocl");
		test(model);
	}

	@Test
	public void testSpecial3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/special3.ocl");
		test(model);
	}

	@Test
	public void testSpecial4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/special4.ocl");
		test(model);
	}

	@Test
	public void testSpecial5() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/special5.ocl");
		test(model);
	}

	@Test
	public void testTaggedValues1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/taggedvalues1.ocl");
		test(model);
	}

	@Test
	public void testTaggedValues2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/taggedvalues2.ocl");
		test(model);
	}

	@Test
	public void testTransitiveClosure1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/transitiveclosure1.ocl");
		test(model);
	}

	@Test
	public void testTransitiveClosure2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/transitiveclosure2.ocl");
		test(model);
	}

	@Test
	public void testTransitiveClosure3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/transitiveclosure3.ocl");
		test(model);
	}

	@Test
	public void testTransitiveClosure4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/transitiveclosure4.ocl");
		test(model);
	}

	@Test
	public void testUnit1() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/unit1.ocl");
		test(model);
	}

	@Test
	public void testUnit2() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/unit2.ocl");
		test(model);
	}

	@Test
	public void testUnit3() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/unit3.ocl");
		test(model);
	}

	@Test
	public void testUnit4() throws RecognitionException, IOException {
		Path model = Paths.get("src/test/resources/example/validGrammarModels/unit4.ocl");
		test(model);
	}
}
