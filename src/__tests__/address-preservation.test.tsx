import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CalculatorProvider } from '../lib/calculator-context';
import { LanguageProvider } from '../lib/LanguageContext';
import ServiceSelector from '../components/ServiceSelector';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock KalenteriVaraus — heavy component with its own fetch calls
vi.mock('../components/KalenteriVaraus', () => ({
  KalenteriVaraus: () => null,
}));

// Mock PriceSummary
vi.mock('../components/PriceSummary', () => ({
  PriceSummary: () => null,
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockFetchDefaults() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      baseKm: 40,
      basePriceVat0: 47.01,
      pricePerKmVat0: 1.028,
      vehicleBaseUpTo40km: 102.79,
      vehicleBase41to80km: 134.66,
      vehiclePricePerKm: 1.028,
      projektiPieniMuuttoBase: 214.46,
      projektiPieniMuuttoKmLimit: 40,
      projektiPricePerKm: 0.549,
      kierratys1Base: 62.95,
      kierratysLisaPerKuorma: 30,
    }),
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CalculatorProvider>
        {children}
      </CalculatorProvider>
    </LanguageProvider>
  );
}

describe('address preservation when switching service category', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetchDefaults();
    window.localStorage.clear();
  });

  it('preserves addresses when switching from kappaletavara to projekti', async () => {
    render(
      <Wrapper>
        <ServiceSelector initialCategory="kappaletavara" />
      </Wrapper>
    );

    // Find pickup/delivery address inputs
    const pickupInput = await screen.findByTestId('pickup-address-input');
    const deliveryInput = await screen.findByTestId('delivery-address-input');

    // Type addresses in the kappaletavara calculator
    await act(async () => {
      fireEvent.change(pickupInput, { target: { value: 'Testikatu 1, Helsinki' } });
      fireEvent.change(deliveryInput, { target: { value: 'Kohdekatu 2, Espoo' } });
    });

    expect(pickupInput).toHaveValue('Testikatu 1, Helsinki');
    expect(deliveryInput).toHaveValue('Kohdekatu 2, Espoo');

    // Switch to projekti category via the desktop tab
    const projektiTab = screen.getByTestId('service-tab-projekti');
    await act(async () => {
      fireEvent.click(projektiTab);
    });

    // After switching, the projekti calculator should show the same addresses
    const pickupAfter = await screen.findByTestId('pickup-address-input');
    const deliveryAfter = await screen.findByTestId('delivery-address-input');

    expect(pickupAfter).toHaveValue('Testikatu 1, Helsinki');
    expect(deliveryAfter).toHaveValue('Kohdekatu 2, Espoo');
  });

  it('preserves addresses when switching from projekti to kappaletavara', async () => {
    render(
      <Wrapper>
        <ServiceSelector initialCategory="projekti" />
      </Wrapper>
    );

    const pickupInput = await screen.findByTestId('pickup-address-input');
    const deliveryInput = await screen.findByTestId('delivery-address-input');

    await act(async () => {
      fireEvent.change(pickupInput, { target: { value: 'Lähtöpaikka 5, Tampere' } });
      fireEvent.change(deliveryInput, { target: { value: 'Määränpää 10, Turku' } });
    });

    expect(pickupInput).toHaveValue('Lähtöpaikka 5, Tampere');
    expect(deliveryInput).toHaveValue('Määränpää 10, Turku');

    const kappaletavaraTab = screen.getByTestId('service-tab-kappaletavara');
    await act(async () => {
      fireEvent.click(kappaletavaraTab);
    });

    const pickupAfter = await screen.findByTestId('pickup-address-input');
    const deliveryAfter = await screen.findByTestId('delivery-address-input');

    expect(pickupAfter).toHaveValue('Lähtöpaikka 5, Tampere');
    expect(deliveryAfter).toHaveValue('Määränpää 10, Turku');
  });
});
