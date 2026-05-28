import ActivityKit
import Foundation

public struct BarakahLockAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public let prayerName: String
    public let startEpoch: Double
    public let endEpoch: Double

    public init(prayerName: String, startEpoch: Double, endEpoch: Double) {
      self.prayerName = prayerName
      self.startEpoch = startEpoch
      self.endEpoch = endEpoch
    }
  }

  public let createdEpoch: Double

  public init(createdEpoch: Double) {
    self.createdEpoch = createdEpoch
  }
}
