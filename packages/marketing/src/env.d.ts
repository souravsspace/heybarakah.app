/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    checkout: import("./lib/checkout").CheckoutInfo;
  }
}
