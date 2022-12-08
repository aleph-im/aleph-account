#!/usr/bin/env python3

"""
This script uploads the build SPA to IPFS.

It does not ping it or do anything else yet, so the result can only be accessed
 as long as the files are not garbage collected.

Requires: 'aioipfs>=0.6.2'
"""

import asyncio
import aioipfs


async def add_files(files: list):
    client = aioipfs.AsyncIPFS(maddr="/dns4/ipfs-2.aleph.im/tcp/443/https")

    async for added_file in client.add(*files, recursive=True):
        print(f"Imported file {added_file['Name']}, CID: {added_file['Hash']}")

    await client.close()


asyncio.run(add_files(["dist/spa"]))
