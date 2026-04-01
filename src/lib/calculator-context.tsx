"use client";

import { createContext, useContext, useState } from "react";
import type { ServiceCategory } from "@/lib/types";

type CalculatorContextValue = {
  pickupAddress: string;
  deliveryAddress: string;
  serviceCategory: ServiceCategory | null;
  estimatedPriceVat0: number | null;
  estimatedPriceVatIncl: number | null;
  setPickupAddress: (v: string) => void;
  setDeliveryAddress: (v: string) => void;
  setServiceCategory: (v: ServiceCategory) => void;
  setEstimatedPriceVat0: (v: number | null) => void;
  setEstimatedPriceVatIncl: (v: number | null) => void;
};

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(null);
  const [estimatedPriceVat0, setEstimatedPriceVat0] = useState<number | null>(null);
  const [estimatedPriceVatIncl, setEstimatedPriceVatIncl] = useState<number | null>(null);

  return (
    <CalculatorContext.Provider
      value={{
        pickupAddress,
        deliveryAddress,
        serviceCategory,
        estimatedPriceVat0,
        estimatedPriceVatIncl,
        setPickupAddress,
        setDeliveryAddress,
        setServiceCategory,
        setEstimatedPriceVat0,
        setEstimatedPriceVatIncl,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  return useContext(CalculatorContext);
}
