import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleNumberPress = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperationPress = (op: string) => {
    if (previousValue !== null && operation !== null && !shouldResetDisplay) {
      handleEquals();
    }
    setPreviousValue(display);
    setOperation(op);
    setShouldResetDisplay(true);
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        result = current !== 0 ? prev / current : 0;
        break;
      case '%':
        result = prev % current;
        break;
    }

    setDisplay(result.toString());
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
  };

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    if (display !== '0') {
      setDisplay((parseFloat(display) * -1).toString());
    }
  };

  const Button = ({
    text,
    onPress,
    color = '#fff',
    backgroundColor = '#333',
    flex = 1,
  }: {
    text: string;
    onPress: () => void;
    color?: string;
    backgroundColor?: string;
    flex?: number;
  }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor, flex }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, { color }]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculator</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.displayContainer}>
        {previousValue && operation && (
          <Text style={styles.previousDisplay}>
            {previousValue} {operation}
          </Text>
        )}
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <View style={styles.row}>
          <Button text="C" onPress={handleClear} backgroundColor="#FF6B6B" />
          <Button text="⌫" onPress={handleBackspace} backgroundColor="#555" />
          <Button text="%" onPress={() => handleOperationPress('%')} backgroundColor="#555" />
          <Button text="÷" onPress={() => handleOperationPress('÷')} backgroundColor="#6200ee" />
        </View>

        <View style={styles.row}>
          <Button text="7" onPress={() => handleNumberPress('7')} />
          <Button text="8" onPress={() => handleNumberPress('8')} />
          <Button text="9" onPress={() => handleNumberPress('9')} />
          <Button text="×" onPress={() => handleOperationPress('×')} backgroundColor="#6200ee" />
        </View>

        <View style={styles.row}>
          <Button text="4" onPress={() => handleNumberPress('4')} />
          <Button text="5" onPress={() => handleNumberPress('5')} />
          <Button text="6" onPress={() => handleNumberPress('6')} />
          <Button text="-" onPress={() => handleOperationPress('-')} backgroundColor="#6200ee" />
        </View>

        <View style={styles.row}>
          <Button text="1" onPress={() => handleNumberPress('1')} />
          <Button text="2" onPress={() => handleNumberPress('2')} />
          <Button text="3" onPress={() => handleNumberPress('3')} />
          <Button text="+" onPress={() => handleOperationPress('+')} backgroundColor="#6200ee" />
        </View>

        <View style={styles.row}>
          <Button text="+/-" onPress={handleToggleSign} />
          <Button text="0" onPress={() => handleNumberPress('0')} />
          <Button text="." onPress={handleDecimal} />
          <Button text="=" onPress={handleEquals} backgroundColor="#4CAF50" />
        </View>
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={20} color="#6200ee" />
        <Text style={styles.infoText}>
          Use this calculator for quick calculations while managing your store
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  displayContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 180,
  },
  previousDisplay: {
    fontSize: 24,
    color: '#888',
    marginBottom: 10,
  },
  display: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    flex: 1,
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#ccc',
    fontSize: 12,
  },
});
