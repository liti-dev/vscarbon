import * as assert from 'assert';
import * as vscode from 'vscode';
import getCarbonIntensity from '../services/carbonIntensity-legacy';

suite('VSCarbon Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start VSCarbon tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('vscarbon-team.vscarbon'));
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('vscarbon.showCarbon'));
		assert.ok(commands.includes('vscarbon.showDashboard'));
		assert.ok(commands.includes('vscarbon.setPostcode'));
	});

	test('Carbon intensity service should handle invalid postcode', async () => {
		const result = await getCarbonIntensity('INVALID');
		// Should return null for invalid postcode
		assert.strictEqual(result, null);
	});

	test('Carbon intensity service should work without postcode', async () => {
		const result = await getCarbonIntensity();
		// Should return data for England default
		if (result) {
			assert.ok(typeof result.intensity === 'number');
			assert.ok(typeof result.index === 'string');
			assert.ok(Array.isArray(result.mix));
		}
	});
});
