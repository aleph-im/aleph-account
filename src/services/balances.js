import axios from 'axios'
import * as solanaWeb3 from '@solana/web3.js'

export async function get_nuls_balance_info (address, explorer_url) {
  let response = await axios.get(`${explorer_url}/addresses/${address}.json`)
  let balance_info = {
    ALEPH: 0,
    NULS: 0
  }
  if ((response.data.unspent_info.unspent_value !== undefined)) {
    balance_info.NULS = response.data.unspent_info.unspent_value / (10 ** 8)
  }
  for (let holding of response.data.token_holdings) {
    balance_info[holding.symbol] = holding.balance / (10 ** holding.decimals)
  }
  return balance_info
}

export async function get_ethereum_balance_info (address, explorer_url, contract_address) {
  let response = await axios.get(`${explorer_url}/getAddressInfo/${address}?apiKey=freekey`)

  let balance_info = {
    ALEPH: 0,
    ETH: 0
  }
  if ((response.data.ETH.balance !== undefined)) {
    balance_info.ETH = response.data.ETH.balance
  }
  if (response.data.tokens !== undefined) {
    for (let holding of response.data.tokens) {
      let decimals = Number(holding.tokenInfo.decimals)
      if ((holding.tokenInfo.symbol === 'ALEPH') &&
          (holding.tokenInfo.address.toLowerCase() !== contract_address.toLowerCase())) {
        continue
      }
      balance_info[holding.tokenInfo.symbol] = holding.balance / (10 ** decimals)
    }
  }
  return balance_info
}

export async function get_solana_balance_info (address, explorer_url, contract_address) {
  let balance_info = {
    ALEPH: 0,
    SOL: 0
  }
  const connection = new solanaWeb3.Connection(explorer_url, 'confirmed')
  // ALEPH mint address
  const ALEPH_MINT_ADDRESS = new solanaWeb3.PublicKey(contract_address)
  // user account
  const userAccount = new solanaWeb3.PublicKey(address)
  let data = await connection.getTokenAccountsByOwner(userAccount, { mint: ALEPH_MINT_ADDRESS })
  let _userAlephAccountAddress = data.value[0].pubkey
  let data2 = await connection.getTokenAccountBalance(_userAlephAccountAddress)
  balance_info.ALEPH = data2.value.uiAmountString
  return balance_info
}

export async function get_neo_balance_info (address, explorer_url) {
  let response = await axios.get(
    `${explorer_url}/api/main_net/v1/get_balance/${address}`)

  let balance_info = {
    ALEPH: 0,
    NEO: 0,
    GAS: 0
  }
  for (let holding of response.data.balance) {
    balance_info[holding.asset_symbol] = holding.amount
  }
  return balance_info
}
