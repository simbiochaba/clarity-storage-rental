# Decentralized Storage Rental System

A blockchain-based decentralized storage rental system built on the Stacks network. This contract allows users to:

- List their available storage space with custom size and price
- Rent storage space from other users for a specified duration
- Manage rental agreements with automatic expiration
- Track rental history and payments

## Features

- Storage providers can list their available space
- Users can rent storage for a specified number of blocks
- Automatic rental expiration based on block height
- Payment handling in STX tokens
- Storage and rental information tracking

## Contract Functions

- `list-storage-space`: List available storage with size and price
- `rent-storage`: Rent storage from a provider
- `end-rental`: End an expired rental agreement
- `get-storage-info`: Get information about listed storage
- `get-rental-info`: Get information about active rentals
