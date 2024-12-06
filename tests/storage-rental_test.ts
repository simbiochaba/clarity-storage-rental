import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can list a storage space",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('storage-rental', 'list-storage-space', [
                types.uint(1000), // 1000 GB
                types.uint(100)   // 100 STX per block
            ], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Can rent storage space",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('storage-rental', 'list-storage-space', [
                types.uint(1000),
                types.uint(100)
            ], wallet1.address),
            
            Tx.contractCall('storage-rental', 'rent-storage', [
                types.principal(wallet1.address),
                types.uint(10) // rent for 10 blocks
            ], wallet2.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectUint(1000); // total cost
    },
});

Clarinet.test({
    name: "Can end rental after expiry",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('storage-rental', 'list-storage-space', [
                types.uint(1000),
                types.uint(100)
            ], wallet1.address),
            
            Tx.contractCall('storage-rental', 'rent-storage', [
                types.principal(wallet1.address),
                types.uint(10)
            ], wallet2.address)
        ]);
        
        // Mine 10 blocks to simulate rental period
        chain.mineEmptyBlock(10);
        
        let endBlock = chain.mineBlock([
            Tx.contractCall('storage-rental', 'end-rental', [
                types.principal(wallet1.address)
            ], wallet2.address)
        ]);
        
        endBlock.receipts[0].result.expectOk().expectBool(true);
    },
});
