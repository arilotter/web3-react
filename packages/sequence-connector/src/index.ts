import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import type { Wallet, ProviderConfig, ConnectOptions, Web3Provider } from "@0xsequence/provider"

interface SequenceConnectorArguments {
  chainId: number
  constructorOptions?: ProviderConfig
  connectOptions?: ConnectOptions
}

export class SequenceConnector extends AbstractConnector {
  private readonly constructorOptions?: ProviderConfig
  private readonly connectOptions?: ConnectOptions
  private chainId: number

  public wallet: Wallet | undefined

  constructor({ chainId, constructorOptions, connectOptions }: SequenceConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.constructorOptions = constructorOptions
    this.connectOptions = connectOptions
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.wallet) {
      const sequence = await import('@0xsequence/provider').then(m => m?.default ?? m)
      this.wallet = new sequence.Wallet(this.constructorOptions?.defaultNetworkId ?? this.chainId, this.constructorOptions);
      const { error } = await this.wallet.connect(this.connectOptions)
      if(error) {
        throw new Error(error)
      }
    }
    const account = await this.wallet.getAddress()
    const provider = await this.wallet.getProvider()
    if(!provider) {
      throw new Error("Failed to get provider from Sequence")
    }

    return { provider, account }
  }

  public async getProvider(): Promise<Web3Provider | undefined> {
    return this.wallet?.getProvider()
  }

  public async getChainId(): Promise<number | string> {
    return this.wallet!.getChainId()
  }

  public async getAccount(): Promise<null | string> {
    return this.wallet?.getAddress() ?? null
  }

  public async deactivate() {}

  public async close() {
    await this.wallet?.disconnect()
    this.emitDeactivate()
  }
}
